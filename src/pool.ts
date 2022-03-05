import { EventEmitter } from "events";
import { EndReason, MasterchatError } from "./errors";
import { ChatResponse, Credentials } from "./interfaces";
import { Action, AddChatItemAction } from "./interfaces/actions";
import {
  IterateChatOptions,
  Masterchat,
  MasterchatOptions,
} from "./masterchat";

interface StreamPoolEvents {
  data: (data: ChatResponse, mc: Masterchat) => void;
  actions: (actions: Action[], mc: Masterchat) => void;
  chats: (chats: AddChatItemAction[], mc: Masterchat) => void;
  end: (reason: EndReason, mc: Masterchat) => void;
  error: (error: MasterchatError | Error, mc: Masterchat) => void;
}

export interface StreamPool {
  on<U extends keyof StreamPoolEvents>(
    event: U,
    listener: StreamPoolEvents[U]
  ): this;
  addListener<U extends keyof StreamPoolEvents>(
    event: U,
    listener: StreamPoolEvents[U]
  ): this;
  off<U extends keyof StreamPoolEvents>(
    event: U,
    listener: StreamPoolEvents[U]
  ): this;
  removeListener<U extends keyof StreamPoolEvents>(
    event: U,
    listener: StreamPoolEvents[U]
  ): this;
  emit<U extends keyof StreamPoolEvents>(
    event: U,
    ...args: Parameters<StreamPoolEvents[U]>
  ): boolean;
}

export class StreamPool extends EventEmitter {
  private pool: Map<string, Masterchat> = new Map();
  private options?: MasterchatOptions;
  private started: boolean = false;

  constructor(options?: MasterchatOptions) {
    super();
    this.options = options;
  }

  public get entries() {
    return Array.from(this.pool.entries());
  }

  public async forEach(
    fn: (agent: Masterchat, videoId: string, index: number) => void
  ) {
    return Promise.allSettled(
      this.entries.map(([videoId, instance], i) =>
        Promise.resolve(fn(instance, videoId, i))
      )
    );
  }

  public setCredentials(credentials?: Credentials | string) {
    this.forEach((instance) => {
      instance.setCredentials(credentials);
    });
  }

  public get(videoId: string) {
    return this.pool.get(videoId);
  }

  /**
   * resolves after every stream closed
   */
  public ensure() {
    return new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        if (this.streamCount() === 0) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * number of active streams
   */
  streamCount() {
    return this.pool.size;
  }

  /**
   * check if the given stream is already subscribed
   */
  has(videoId: string) {
    return this.pool.has(videoId);
  }

  /**
   * subscribe live chat.
   * always guarantees single instance for each stream.
   */
  subscribe(
    videoId: string,
    channelId: string,
    iterateOptions?: IterateChatOptions
  ): Masterchat {
    if (this.has(videoId)) return this.pool.get(videoId)!;

    const mc = new Masterchat(videoId, channelId, this.options);

    mc.on("end", (reason) => this._handleEnd(mc, reason));
    mc.on("error", (err) => this._handleError(mc, err));
    mc.on("data", (data) => {
      this._handleData(mc, data);
    });
    mc.on("actions", (actions) => {
      this._handleActions(mc, actions);
    });
    mc.on("chats", (chats) => {
      this._handleChats(mc, chats);
    });
    mc.listen(iterateOptions);

    if (!this.started) {
      this.started = true;
      this.ensure();
    }

    this.pool.set(videoId, mc);

    return mc;
  }

  /**
   * stop subscribing live chat
   */
  unsubscribe(videoId: string) {
    const mc = this.pool.get(videoId);
    if (!mc) return;
    mc.stop(); // will emit 'end' event
  }

  private _handleData(mc: Masterchat, data: ChatResponse) {
    this.emit("data", data, mc);
  }

  private _handleActions(mc: Masterchat, actions: Action[]) {
    this.emit("actions", actions, mc);
  }

  private _handleChats(mc: Masterchat, chats: AddChatItemAction[]) {
    this.emit("chats", chats, mc);
  }

  private _handleEnd(mc: Masterchat, reason: EndReason) {
    this.pool.delete(mc.videoId);
    this.emit("end", reason, mc);
  }

  private _handleError(mc: Masterchat, err: MasterchatError | Error) {
    this.pool.delete(mc.videoId);
    this.emit("error", err, mc);
  }
}
