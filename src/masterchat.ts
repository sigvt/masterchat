import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { EventEmitter } from "events";
import { AsyncIterator } from "iterator-helpers-polyfill";
import { buildMeta } from "./api";
import { buildAuthHeaders } from "./auth";
import { parseAction } from "./chat";
import { parseMarkChatItemAsDeletedAction } from "./chat/actions/markChatItemAsDeletedAction";
import { pickThumbUrl } from "./chat/utils";
import * as Constants from "./constants";
import { parseMetadataFromEmbed, parseMetadataFromWatch } from "./context";
import {
  AbortError,
  AccessDeniedError,
  DisabledChatError,
  EndReason,
  InvalidArgumentError,
  MasterchatError,
  MembersOnlyError,
  NoPermissionError,
  UnavailableError,
} from "./errors";
import {
  ChatResponse,
  Credentials,
  RenderingPriority,
  YTCommentThreadRenderer,
  YTContinuationItem,
} from "./interfaces";
import {
  Action,
  AddChatItemAction,
  MarkChatItemAsDeletedAction,
} from "./interfaces/actions";
import { ActionCatalog, ActionInfo } from "./interfaces/contextActions";
import { TranscriptSegment } from "./interfaces/transcript";
import {
  YTAction,
  YTActionResponse,
  YTChatErrorStatus,
  YTChatResponse,
  YTGetItemContextMenuResponse,
  YTLiveChatTextMessageRenderer,
} from "./interfaces/yt/chat";
import { GetTranscriptResponse } from "./interfaces/yt/transcript";
import {
  addModeratorParams,
  b64tou8,
  csc,
  CscOptions,
  getTranscriptParams,
  hideParams,
  liveReloadContinuation,
  pinParams,
  removeMessageParams,
  replayTimedContinuation,
  sendMessageParams,
  timeoutParams,
  unpinParams,
} from "./protobuf";
import {
  debugLog,
  delay,
  getTimedContinuation,
  stringify,
  toVideoId,
  unwrapReplayActions,
  usecToSeconds,
  withContext,
} from "./utils";

export type RetryOptions = {
  retry?: number;
  retryInterval?: number;
};

export interface IterateChatOptions extends FetchChatOptions {
  /**
   * ignore first response fetched by reload token
   * set it to false which means you might get chats already processed before when recovering MasterchatAgent from error. Make sure you have unique index for chat id to prevent duplication.
   * @default false
   * */
  ignoreFirstResponse?: boolean;

  /** pass previously fetched token to resume chat fetching */
  continuation?: string;
}

export interface FetchChatOptions {
  /** fetch top chat instead of all chat */
  topChat?: boolean;
}

export type ChatListener = Promise<void>;

export interface Events {
  data: (data: ChatResponse, mc: Masterchat) => void;
  actions: (actions: Action[], mc: Masterchat) => void;
  chats: (chats: AddChatItemAction[], mc: Masterchat) => void;
  chat: (chat: AddChatItemAction, mc: Masterchat) => void;
  end: (reason: EndReason) => void;
  error: (error: MasterchatError | Error) => void;
}

export interface Masterchat {
  on<U extends keyof Events>(event: U, listener: Events[U]): this;
  once<U extends keyof Events>(event: U, listener: Events[U]): this;
  addListener<U extends keyof Events>(event: U, listener: Events[U]): this;
  off<U extends keyof Events>(event: U, listener: Events[U]): this;
  removeListener<U extends keyof Events>(event: U, listener: Events[U]): this;
  emit<U extends keyof Events>(
    event: U,
    ...args: Parameters<Events[U]>
  ): boolean;
}

export interface MasterchatOptions {
  /** you can grab Credentials using `extra/credential-fetcher` */
  credentials?: Credentials | string;

  /** set live chat mode
   *
   * ```
   * if undefined,
   *   live -> OK
   *   archive -> OK
   *
   * if "live":
   *   live -> OK
   *   archive -> throw DisabledChatError
   *
   * if "replay":
   *   live -> throw DisabledChatError
   *   archive -> OK
   * ```
   */
  mode?: "live" | "replay";

  axiosInstance?: AxiosInstance;
}

export class Masterchat extends EventEmitter {
  public videoId!: string;
  public channelId!: string;

  public isLive?: boolean;
  public channelName?: string;
  public title?: string;

  private axiosInstance: AxiosInstance;
  private listener: ChatListener | null = null;
  private listenerAbortion: AbortController = new AbortController();

  private credentials?: Credentials;

  /*
   * Private API
   */

  private async postWithRetry<T>(
    input: string,
    body: any,
    options?: RetryOptions
  ): Promise<T> {
    // this.log("postWithRetry", input);
    const errors = [];

    let remaining = options?.retry ?? 0;
    const retryInterval = options?.retryInterval ?? 1000;

    while (true) {
      try {
        return await this.post<T>(input, body);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === "canceled") throw new AbortError();

          errors.push(err);

          if (remaining > 0) {
            await delay(retryInterval);
            remaining -= 1;
            debugLog(
              `Retrying(postJson) remaining=${remaining} after=${retryInterval}`
            );
            continue;
          }

          (err as any).errors = errors;
        }
        throw err;
      }
    }
  }

  private async post<T>(
    input: string,
    body: any,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    if (!input.startsWith("http")) {
      input = Constants.DO + input;
    }

    const res = await this.axiosInstance.request<T>({
      ...config,
      url: input,
      signal: this.listenerAbortion.signal,
      method: "POST",
      headers: {
        ...config.headers,
        "Content-Type": "application/json",
        ...(this.credentials && buildAuthHeaders(this.credentials)),
        ...Constants.DH,
      },
      data: body,
    });

    return res.data;
  }

  private async get<T>(
    input: string,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    if (!input.startsWith("http")) {
      input = Constants.DO + input;
    }

    const res = await this.axiosInstance.request<T>({
      ...config,
      url: input,
      signal: this.listenerAbortion.signal,
      headers: {
        ...config.headers,
        ...(this.credentials && buildAuthHeaders(this.credentials)),
        ...Constants.DH,
      },
    });

    return res.data;
  }

  private log(label: string, ...obj: any) {
    debugLog(`${label}(${this.videoId}):`, ...obj);
  }

  private cvPair() {
    return {
      channelId: this.channelId,
      videoId: this.videoId,
    };
  }

  /**
   * NOTE: urlParams: pbj=1|0
   */
  private async getActionCatalog(
    contextMenuEndpointParams: string
  ): Promise<ActionCatalog | undefined> {
    const query = new URLSearchParams({
      params: contextMenuEndpointParams,
    });
    const endpoint = Constants.EP_GICM + "&" + query.toString();
    const response = await this.postWithRetry<YTGetItemContextMenuResponse>(
      endpoint,
      withContext(),
      {
        retry: 2,
      }
    );

    if (response.error) {
      // TODO: handle this
      // {
      //   "error": {
      //     "code": 400,
      //     "message": "Precondition check failed.",
      //     "errors": [
      //       {
      //         "message": "Precondition check failed.",
      //         "domain": "global",
      //         "reason": "failedPrecondition"
      //       }
      //     ],
      //     "status": "FAILED_PRECONDITION"
      //   }
      // }
      return undefined;
    }

    let items: ActionCatalog = {};
    for (const item of response.liveChatItemContextMenuSupportedRenderers!
      .menuRenderer.items) {
      const rdr =
        item.menuServiceItemRenderer ?? item.menuNavigationItemRenderer!;
      const text = rdr.text.runs[0].text;

      switch (text) {
        case "Report": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.report = buildMeta(endpoint);
          break;
        }
        case "Block": {
          const endpoint =
            item.menuNavigationItemRenderer!.navigationEndpoint
              .confirmDialogEndpoint!.content.confirmDialogRenderer
              .confirmButton.buttonRenderer.serviceEndpoint;
          items.block = buildMeta(endpoint);
          break;
        }
        case "Unblock": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.unblock = buildMeta(endpoint);
          break;
        }
        case "Pin message": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.pin = buildMeta(endpoint);
          break;
        }
        case "Unpin message": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.unpin = buildMeta(endpoint);
          break;
        }
        case "Remove": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.remove = buildMeta(endpoint);
          break;
        }
        case "Put user in timeout": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.timeout = buildMeta(endpoint);
          break;
        }
        case "Hide user on this channel": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.hide = buildMeta(endpoint);
          break;
        }
        case "Unhide user on this channel": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.unhide = buildMeta(endpoint);
          break;
        }
        case "Add moderator": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.addModerator = buildMeta(endpoint);
          break;
        }
        case "Remove moderator": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.removeModerator = buildMeta(endpoint);
          break;
        }
      }
    }
    return items;
  }

  private async sendAction(actionInfo: ActionInfo): Promise<YTAction[]> {
    const url = actionInfo.url;
    let json: YTActionResponse;
    if (actionInfo.isPost) {
      json = await this.post<YTActionResponse>(url, {
        body: withContext({
          params: actionInfo.params,
        }),
      });
    } else {
      json = await this.get(url);
    }
    if (!json.success) {
      throw new Error(`Failed to perform action: ` + JSON.stringify(json));
    }
    return json.actions;
  }

  /*
   * Public API
   */

  /**
   * Useful when you don't know channelId or isLive status
   */
  public static async init(
    videoIdOrUrl: string,
    options: MasterchatOptions = {}
  ) {
    const videoId = toVideoId(videoIdOrUrl);
    if (!videoId) {
      throw new InvalidArgumentError(
        `Failed to extract video id: ${videoIdOrUrl}`
      );
    }
    // set channelId "" as populateMetadata will fill out it anyways
    const mc = new Masterchat(videoId, "", options);
    await mc.populateMetadata();
    return mc;
  }

  /**
   * Much faster than Masterchat.init
   */
  constructor(
    videoId: string,
    channelId: string,
    { mode, credentials, axiosInstance }: MasterchatOptions = {}
  ) {
    super();
    this.videoId = videoId;
    this.channelId = channelId;
    this.isLive =
      mode === "live" ? true : mode === "replay" ? false : undefined;

    this.axiosInstance =
      axiosInstance ??
      axios.create({
        timeout: 4000,
      });

    this.setCredentials(credentials);
  }

  /**
   * Context API
   */
  public async populateMetadata(): Promise<void> {
    const metadata = await this.fetchMetadataFromWatch(this.videoId);

    this.title = metadata.title;
    this.channelId = metadata.channelId;
    this.channelName = metadata.channelName;
    this.isLive ??= metadata.isLive;
  }

  public async fetchMetadataFromWatch(id: string) {
    try {
      const html = await this.get<string>("/watch?v=" + this.videoId);
      return parseMetadataFromWatch(html);
    } catch (err) {
      // Check ban status
      if ((err as AxiosError).code === "429") {
        throw new AccessDeniedError("Rate limit exceeded: " + this.videoId);
      }
      throw err;
    }
  }

  public async fetchMetadataFromEmbed(id: string) {
    try {
      const html = await this.get<string>(`/embed/${id}`);
      return parseMetadataFromEmbed(html);
    } catch (err) {
      if ((err as AxiosError).code === "429")
        throw new AccessDeniedError("Rate limit exceeded: " + id);
    }
  }

  public get metadata() {
    return {
      videoId: this.videoId,
      channelId: this.channelId,
      channelName: this.channelName,
      title: this.title,
      isLive: this.isLive,
    };
  }

  /**
   * Set credentials. This will take effect on the subsequent requests.
   */
  public setCredentials(credentials?: Credentials | string): void {
    if (typeof credentials === "string") {
      credentials = JSON.parse(
        new TextDecoder().decode(b64tou8(credentials))
      ) as Credentials;
    }

    this.credentials = credentials;
  }

  /**
   * (EventEmitter API)
   * start listening live stream
   */
  public listen(iterateOptions?: IterateChatOptions) {
    if (this.listener) return this.listener;

    this.listenerAbortion = new AbortController();

    let handledFirstResponse = false;

    const makePromise = async ({
      iterateOptions,
    }: {
      iterateOptions?: IterateChatOptions;
    }) => {
      // NOTE: `ignoreFirstResponse=false` means you might get chats already processed before when recovering MasterchatAgent from error. Make sure you have unique index for chat id to prevent duplication.
      for await (const res of this.iterate(iterateOptions)) {
        handledFirstResponse = true;

        this.emit("data", res, this);

        const { actions } = res;
        this.emit("actions", actions, this);

        // only normal chats
        if (this.listenerCount("chats") > 0 || this.listenerCount("chat") > 0) {
          const chats = actions.filter(
            (action): action is AddChatItemAction =>
              action.type === "addChatItemAction"
          );
          this.emit("chats", chats, this);
          chats.forEach((chat) => this.emit("chat", chat, this));
        }
      }
    };

    this.listener = makePromise({
      iterateOptions,
    })
      .then(() => {
        // live chat closed by streamer
        this.emit("end", null);
      })
      .catch((err) => {
        if (err instanceof AbortError) return;

        // special treatment for unrecoverable unavailable/private errors
        // emit 'end' only if ->
        //   (not first response) && unrecoverable (private || unavailable)
        if (
          err instanceof MasterchatError &&
          [
            "private",
            "unavailable",
            "disabled", // disabled ()
          ].includes(err.code) &&
          handledFirstResponse
        ) {
          const reason = (() => {
            switch (err.code) {
              case "private":
                return "privated";
              case "unavailable":
                return "deleted";
              case "disabled":
                return "disabled";
              default:
                return null;
            }
          })();
          this.emit("end", reason);
          return;
        }

        this.emit("error", err);
      })
      .finally(() => {
        this.listener = null;
      });

    return this.listener;
  }

  /**
   * (EventEmitter API)
   * stop listening live stream
   */
  public stop(): void {
    if (!this.listener) return;
    this.listenerAbortion.abort();
    this.emit("end", "aborted");
  }

  /**
   * (EventEmitter API)
   * returns listener status
   */
  public get stopped() {
    return this.listener === null;
  }

  /**
   * AsyncIterator API
   */
  public iter(options?: IterateChatOptions): AsyncIterator<Action> {
    return AsyncIterator.from<ChatResponse>(
      this.iterate(options)
    ).flatMap<Action>((action) => action.actions);
  }

  /**
   * (AsyncGenerator API)
   * Iterate until live stream ends
   */
  public async *iterate({
    topChat = false,
    ignoreFirstResponse = false,
    continuation,
  }: IterateChatOptions = {}): AsyncGenerator<ChatResponse> {
    const signal = this.listenerAbortion.signal;

    if (signal.aborted) {
      throw new AbortError();
    }

    let token: any = continuation ? continuation : { top: topChat };

    let treatedFirstResponse = false;

    // continuously fetch chat fragments
    while (true) {
      const res = await this.fetch(token);
      const startMs = Date.now();

      // handle chats
      if (!(ignoreFirstResponse && !treatedFirstResponse)) {
        yield res;
      }

      treatedFirstResponse = true;

      // refresh continuation token
      const { continuation } = res;

      if (!continuation) {
        // stream ended normally
        break;
      }

      token = continuation.token;

      if (this.isLive ?? true) {
        const driftMs = Date.now() - startMs;
        const timeoutMs = continuation.timeoutMs - driftMs;
        if (timeoutMs > 500) {
          await delay(timeoutMs, signal);
        }
      }
    }
  }

  public async fetch(options?: FetchChatOptions): Promise<ChatResponse>;
  public async fetch(
    token: string,
    options?: FetchChatOptions
  ): Promise<ChatResponse>;
  public async fetch(
    tokenOrOptions?: string | FetchChatOptions,
    maybeOptions?: FetchChatOptions
  ): Promise<ChatResponse> {
    const options =
      (typeof tokenOrOptions === "string" ? maybeOptions : tokenOrOptions) ??
      {};
    const topChat = options.topChat ?? false;
    const target = this.cvPair();

    let retryRemaining = 5;
    const retryInterval = 1000;

    let requestUrl: string = "";
    let requestBody;
    let payload: YTChatResponse;

    function applyNewLiveStatus(isLive: boolean) {
      requestUrl = isLive ? Constants.EP_GLC : Constants.EP_GLCR;

      const continuation =
        typeof tokenOrOptions === "string"
          ? tokenOrOptions
          : isLive
          ? liveReloadContinuation(target, { top: topChat })
          : replayTimedContinuation(target, { top: topChat });

      requestBody = withContext({
        continuation,
      });
    }

    applyNewLiveStatus(this.isLive ?? true);

    loop: while (true) {
      try {
        payload = await this.post<YTChatResponse>(requestUrl, requestBody);
      } catch (err) {
        // handle user cancallation
        if ((err as any)?.message === "canceled") {
          this.log(`fetch`, `Request canceled`);
          throw new AbortError();
        }

        // handle server errors
        if ((err as any)?.isAxiosError) {
          const { code: axiosErrorCode, response } = err as AxiosError<{
            error: {
              code: number;
              status: string;
              message: string;
            };
          }>;

          // handle early timeout
          if (
            axiosErrorCode === "ECONNABORTED" ||
            axiosErrorCode === "ERR_REQUEST_ABORTED"
          ) {
            if (retryRemaining > 0) {
              retryRemaining -= 1;
              this.log(
                `fetch`,
                `Retrying ${retryRemaining} / ${retryInterval}ms cause=EARLY_TIMEOUT`
              );
              await delay(retryInterval);
              continue loop;
            }
          }

          if (!response) {
            this.log(
              "fetch",
              `Empty error response ${err} (${axiosErrorCode})`
            );
            throw new Error(
              `Axios got empty error response: ${err} (${axiosErrorCode})`
            );
          }

          /** error.code ->
           * 400: request contains an invalid argument
           *   - when attempting to access livechat while it is already in replay mode
           * 403: no permission
           *   - video was made private by uploader
           *   - something went wrong (server-side)
           * 404: not found
           *   - removed by uploader
           * 500: internal error
           *   - server-side failure
           * 503: The service is currently unavailable
           *   - temporary server-side failure
           */
          const { code, status, message } = response.data.error;
          this.log(`fetch`, `API error: ${code} (${status}): ${message}`);

          switch (status) {
            // stream got privated
            case YTChatErrorStatus.PermissionDenied:
              throw new NoPermissionError(message);

            // stream got deleted
            case YTChatErrorStatus.NotFound:
              throw new UnavailableError(message);

            // stream already turned into archive OR received completely malformed token
            case YTChatErrorStatus.Invalid:
              throw new InvalidArgumentError(message);

            // it might be a temporary issue so you should retry immediately
            case YTChatErrorStatus.Unavailable:
            case YTChatErrorStatus.Internal:
              if (retryRemaining > 0) {
                retryRemaining -= 1;
                this.log(
                  `fetch`,
                  `Retrying ${retryRemaining} / ${retryInterval}ms cause=${status}`
                );
                await delay(retryInterval);
                continue loop;
              }

            default:
              this.log(
                `fetch`,
                `[action required] Got unrecognized error from the API:`,
                status,
                message,
                JSON.stringify(response.data)
              );
              throw new Error(message);
          }
        }

        // handle client-side errors
        // ECONNRESET, ETIMEOUT, etc
        this.log(`fetch`, `Unrecoverable error:`, err);
        throw err;
      }

      const { continuationContents } = payload;

      if (!continuationContents) {
        /** there's several possibilities lied here:
         * 1. live chat is over (primary)
         * 2. turned into membership-only stream
         * 3. given video is neither a live stream nor an archived stream
         * 4. chat got disabled
         */
        const obj = Object.assign({}, payload) as any;
        delete obj["responseContext"];

        if ("contents" in obj) {
          const reason = stringify(obj.contents.messageRenderer.text.runs);
          if (/disabled/.test(reason)) {
            // {contents: "Chat is disabled for this live stream."} => pre-chat unavailable
            // or accessing replay chat with live chat token
            // retry with replay endpoint if isLive is unknown
            if (this.isLive === undefined) {
              this.log("fetch", "Switched to replay endpoint");
              this.isLive = false;
              applyNewLiveStatus(false);
              continue loop;
            }

            throw new DisabledChatError(reason);
          } else if (/currently unavailable/.test(reason)) {
            // {contents: "Sorry, live chat is currently unavailable"} =>
            // - Turned into members-only stream
            // - No stream recordings
            throw new MembersOnlyError(reason);
          }
          this.log(`fetch`, `continuationNotFound(with contents)`, reason);
        } else if ("trackingParams" in obj) {
          // {trackingParams} => ?
        }

        // {} => Live stream ended
        return {
          actions: [],
          continuation: undefined,
          error: null,
        };
      }

      const newContinuation = getTimedContinuation(continuationContents);

      let rawActions = continuationContents.liveChatContinuation.actions;

      // this means no chat available between the time window
      if (!rawActions) {
        return {
          actions: [],
          continuation: newContinuation,
          error: null,
        };
      }

      // unwrap replay actions
      if (!(this.isLive ?? true)) {
        rawActions = unwrapReplayActions(rawActions);
      }

      const actions = rawActions
        .map(parseAction)
        .filter((a): a is Action => a !== undefined);

      const chat: ChatResponse = {
        actions,
        continuation: newContinuation,
        error: null,
      };

      return chat;
    }
  }

  /**
   * NOTE: invalid params -> "actions":[{"liveChatAddToToastAction":{"item":{"notificationTextRenderer":{"successResponseText":{"runs":[{"text":"Error, try again."}]},"trackingParams":"CAAQyscDIhMI56_wmNj89wIV0HVgCh2Qow9y"}}}}]
   */

  /**
   * Send Message API
   */

  public async sendMessage(
    message: string
  ): Promise<YTLiveChatTextMessageRenderer> {
    const params = sendMessageParams(this.cvPair());

    const body = withContext({
      richMessage: {
        textSegments: [
          {
            text: message,
          },
        ],
      },
      params,
    });

    const res = await this.postWithRetry<YTActionResponse>(
      Constants.EP_SM,
      body
    );

    if (res.timeoutDurationUsec) {
      // You are timeouted
      const timeoutSec = usecToSeconds(res.timeoutDurationUsec);
      throw new Error(
        `You have been placed in timeout for ${timeoutSec} seconds`
      );
    }

    const item = res.actions?.[0].addChatItemAction?.item;
    if (!(item && "liveChatTextMessageRenderer" in item)) {
      throw new Error(`Invalid response: ` + item);
    }
    return item.liveChatTextMessageRenderer;
  }

  /**
   * Live Chat Action API
   */

  public async pin(chatId: string) {
    const params = pinParams(chatId, this.cvPair());
    const res = await this.post<YTActionResponse>(
      Constants.EP_LCA,
      withContext({
        params,
      })
    );
    if (!res.success) {
      throw new Error(`Failed to pin chat: ` + JSON.stringify(res));
    }
    return res; // TODO
  }

  public async unpin(actionId: string) {
    const params = unpinParams(actionId, this.cvPair());

    const res = await this.post<YTActionResponse>(
      Constants.EP_LCA,
      withContext({
        params,
      })
    );

    if (!res.success) {
      throw new Error(`Failed to unpin chat: ` + JSON.stringify(res));
    }

    return res; // TODO
  }

  /**
   * Moderate API
   */

  public async remove(chatId: string): Promise<MarkChatItemAsDeletedAction> {
    const params = removeMessageParams(chatId, this.cvPair());

    const res = await this.post<YTActionResponse>(
      Constants.EP_MOD,
      withContext({
        params,
      })
    );

    if (!res.success) {
      // {"error":{"code":501,"message":"Operation is not implemented, or supported, or enabled.","errors":[{"message":"Operation is not implemented, or supported, or enabled.","domain":"global","reason":"notImplemented"}],"status":"UNIMPLEMENTED"}}
      throw new Error(`Failed to remove chat: ` + JSON.stringify(res));
    }

    const payload = res.actions[0].markChatItemAsDeletedAction;

    if (!payload) {
      throw new Error(
        `Invalid response when removing chat: ${JSON.stringify(res)}`
      );
    }

    return parseMarkChatItemAsDeletedAction(payload);
  }

  /**
   * Put user in timeout for 300 seconds
   */
  public async timeout(channelId: string): Promise<void> {
    const params = timeoutParams(channelId, this.cvPair());

    const res = await this.post<YTActionResponse>(
      Constants.EP_MOD,
      withContext({
        params,
      })
    );

    if (!res.success) {
      throw new Error(`Failed to timeout user: ` + JSON.stringify(res));
    }
  }

  /**
   * Hide user on the channel
   */
  public async hide(targetChannelId: string): Promise<void> {
    const params = hideParams(targetChannelId, this.cvPair());

    const res = await this.post<YTActionResponse>(
      Constants.EP_MOD,
      withContext({
        params,
      })
    );

    if (!res.success) {
      throw new Error(`Failed to hide user: ` + JSON.stringify(res));
    }

    // NOTE: res.actions[0] -> {"liveChatAddToToastAction":{"item":{"notificationActionRenderer":{"responseText":{"runs":[{"text":"This user's messages will be hidden"}]},"actionButton":{"buttonRenderer":{"style":"STYLE_BLUE_TEXT","size":"SIZE_DEFAULT","isDisabled":false,"text":{"runs":[{"text":"Undo"}]},"command":{...}}}}}}}
  }

  public async unhide(channelId: string): Promise<void> {
    const params = hideParams(channelId, this.cvPair(), true);

    const res = await this.post<YTActionResponse>(
      Constants.EP_MOD,
      withContext({
        params,
      })
    );

    if (!res.success) {
      throw new Error(`Failed to unhide user: ` + JSON.stringify(res));
    }
  }

  // TODO: narrow down return type
  public async block(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.block;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  public async unblock(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.unblock;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  /**
   * Manage User API
   */

  public async addModerator(channelId: string) {
    const params = addModeratorParams(channelId, this.cvPair());
    const res = await this.post<YTActionResponse>(
      Constants.EP_MU,
      withContext({
        params,
      })
    );
    if (!res.success) {
      throw new Error(`Failed to perform action: ` + JSON.stringify(res));
    }
    return res; // TODO
  }

  public async removeModerator(channelId: string) {
    const params = addModeratorParams(channelId, this.cvPair(), true);
    const res = await this.post<YTActionResponse>(
      Constants.EP_MU,
      withContext({
        params,
      })
    );
    if (!res.success) {
      throw new Error(`Failed to perform action: ` + JSON.stringify(res));
    }
    return res; // TODO
  }

  /*
   * Video Comments API
   */

  public async getComment(commentId: string) {
    const comments = await this.getComments({
      highlightedCommentId: commentId,
    });
    const first = comments.comments?.[0];
    if (first.renderingPriority !== RenderingPriority.LinkedComment)
      return undefined;

    return first;
  }

  public async getComments(continuation: string | CscOptions = {}) {
    if (typeof continuation !== "string") {
      continuation = csc(this.videoId, continuation);
    }

    const body = withContext({
      continuation,
    });

    const payload = await this.post<any>(Constants.EP_NXT, body);

    const endpoints = payload.onResponseReceivedEndpoints;
    const isAppend = endpoints.length === 1;

    const items: YTContinuationItem[] = isAppend
      ? endpoints[0].appendContinuationItemsAction.continuationItems
      : endpoints[1].reloadContinuationItemsCommand.continuationItems;

    const nextContinuation =
      items[items.length - 1].continuationItemRenderer?.continuationEndpoint
        .continuationCommand.token;

    const comments = items
      .map((item) => item.commentThreadRenderer)
      .filter((rdr): rdr is YTCommentThreadRenderer => rdr !== undefined);

    return {
      comments,
      continuation: nextContinuation,
      next: nextContinuation
        ? () => this.getComments(nextContinuation)
        : undefined,
    };
  }

  /*
   * Transcript API
   */

  /**
   * Fetch transcript
   */
  public async getTranscript(language: string): Promise<TranscriptSegment[]> {
    const fetchTranscript = async ({
      autoGenerated,
    }: {
      autoGenerated: boolean;
    }) => {
      const res = await this.post<GetTranscriptResponse>(Constants.EP_GTS, {
        context: {
          client: { clientName: "WEB", clientVersion: "2.20220502.01.00" },
        },
        params: getTranscriptParams(this.videoId, language, autoGenerated),
      });

      const rdr =
        res.actions[0].updateEngagementPanelAction.content.transcriptRenderer
          .content.transcriptSearchPanelRenderer;

      const subtitles =
        rdr.footer?.transcriptFooterRenderer.languageMenu
          ?.sortFilterSubMenuRenderer.subMenuItems;
      const segments = rdr.body.transcriptSegmentListRenderer.initialSegments
        ?.map((seg) => seg.transcriptSegmentRenderer)
        .map((rdr) => ({
          startMs: Number(rdr.startMs),
          endMs: Number(rdr.endMs),
          snippet: rdr.snippet.runs,
          startTimeText: rdr.startTimeText.simpleText,
        }));

      return { segments, subtitles };
    };

    let res = await fetchTranscript({ autoGenerated: true });
    if (!res.segments && res.subtitles) {
      this.log("transcript", "retry fetching non-autogenerated transcript");
      res = await fetchTranscript({ autoGenerated: false });
    }

    if (!res.segments) {
      throw new Error("No transcript available for " + language);
    }

    return res.segments;
  }

  /*
   * Playlist API
   */

  public async getPlaylist(browseId: string | { type: "membersOnly" }) {
    if (typeof browseId === "object") {
      switch (browseId.type) {
        case "membersOnly": {
          browseId = "VLUUMO" + this.channelId.replace(/^UC/, "");
          break;
        }
        default: {
          throw new Error(`Invalid type "${browseId.type}"`);
        }
      }
    }

    const res = await this.post<any>(
      "https://www.youtube.com/youtubei/v1/browse",
      {
        context: {
          client: { clientName: "WEB", clientVersion: "2.20220411.09.00" },
        },
        browseId,
      }
    );

    const metadata = res.metadata.playlistMetadataRenderer;
    const title = metadata.title;
    const description = metadata.description;

    const contents =
      res.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
        .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
        .playlistVideoListRenderer.contents;

    const videos = contents.map((content: any) => {
      const rdr = content.playlistVideoRenderer;
      const videoId = rdr.videoId;
      const title = rdr.title.runs;
      const lengthText = rdr.lengthText.simpleText; // "2:12:01"
      const length = Number(rdr.lengthSeconds); // "7921"
      const thumbnailUrl = pickThumbUrl(rdr.thumbnail);
      return {
        videoId,
        title,
        thumbnailUrl,
        length,
        lengthText,
      };
    });

    this.log(title, description, videos);

    return {
      title,
      description,
      videos,
    };
  }
}
