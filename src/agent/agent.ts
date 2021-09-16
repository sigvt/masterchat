/**
 * Masterchat agent
 */

import { EventEmitter } from "events";
import { Masterchat, MasterchatOptions } from "..";
import { MasterchatAbortError, MasterchatError } from "../error";
import {
  Action,
  AddChatItemAction,
  ChatResponse,
  IterateChatOptions,
} from "../services/chat/types";

export type MasterchatEventLoop = Promise<void>;

interface MasterchatAgentEvents {
  data: (data: ChatResponse) => void;
  actions: (actions: Action[]) => void;
  chats: (chats: AddChatItemAction[]) => void;
  end: (reason?: string) => void;
  error: (error: MasterchatError | Error) => void;
}

export interface MasterchatAgent {
  on<U extends keyof MasterchatAgentEvents>(
    event: U,
    listener: MasterchatAgentEvents[U]
  ): this;
  addListener<U extends keyof MasterchatAgentEvents>(
    event: U,
    listener: MasterchatAgentEvents[U]
  ): this;
  off<U extends keyof MasterchatAgentEvents>(
    event: U,
    listener: MasterchatAgentEvents[U]
  ): this;
  removeListener<U extends keyof MasterchatAgentEvents>(
    event: U,
    listener: MasterchatAgentEvents[U]
  ): this;
  emit<U extends keyof MasterchatAgentEvents>(
    event: U,
    ...args: Parameters<MasterchatAgentEvents[U]>
  ): boolean;
}

export interface MasterchatAgentMetadata {
  videoId: string;
  channelId: string;
  channelName?: string;
  title?: string;
  isLive?: boolean;
}

export class MasterchatAgent extends EventEmitter {
  public videoId: string;
  public channelId: string;
  public options?: MasterchatOptions;
  public metadata: MasterchatAgentMetadata;

  private eventLoop: MasterchatEventLoop | null = null;
  private abortController: AbortController;

  constructor(videoId: string, channelId: string, options?: MasterchatOptions) {
    super();
    this.videoId = videoId;
    this.channelId = channelId;
    this.options = options;
    this.abortController = new AbortController();
    this.metadata = {
      videoId: this.videoId,
      channelId: this.channelId,
    };
  }

  public start(iterateOptions?: IterateChatOptions): void {
    this.eventLoop = this.eventLoopFactory({
      signal: this.abortController.signal,
      iterateOptions,
    })
      .then(() => {
        // live chat closed by streamer
        this.emit("end");
      })
      .catch((err) => {
        if (err instanceof MasterchatAbortError) {
          // should already be handled by stop()
          return;
        }
        this.emit("error", err);
      });
  }

  public stop(reason: string): void {
    if (!this.eventLoop) return;

    this.abortController.abort();
    this.eventLoop = null;
    this.emit("end", reason);
  }

  private async eventLoopFactory({
    signal,
    iterateOptions,
  }: {
    signal: AbortSignal;
    iterateOptions?: IterateChatOptions;
  }): MasterchatEventLoop {
    signal.addEventListener("abort", () => {
      throw new MasterchatAbortError("Masterchat connection aborted by signal");
    });

    const mc = new Masterchat(this.videoId, this.channelId, this.options);

    this.metadata = {
      videoId: this.videoId,
      channelId: this.channelId,
      channelName: mc?.channelName,
      title: mc?.title,
      isLive: mc?.isLive,
    };

    // NOTE: `ignoreFirstResponse=false` means you might get chats already processed before when recovering MasterchatAgent from error. Make sure you have unique index for chat id to prevent duplication.
    for await (const res of mc.iterate(iterateOptions)) {
      this.emit("data", res);

      const { actions } = res;
      this.emit("actions", actions);

      // only normal chats
      if (this.listenerCount("chats") > 0) {
        const chats = actions.filter(
          (action): action is AddChatItemAction =>
            action.type === "addChatItemAction"
        );
        this.emit("chats", chats);
      }
    }
  }
}
