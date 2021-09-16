/**
 * Masterchat agent
 */

import { EventEmitter } from "events";
import {
  Action,
  AddChatItemAction,
  ChatResponse,
  IterateChatOptions,
  Masterchat,
  MasterchatError,
  MasterchatOptions,
} from "..";

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

export class MasterchatAgent extends EventEmitter {
  public videoId: string;
  public channelId: string;
  public options?: MasterchatOptions;

  private eventLoop: MasterchatEventLoop | null = null;
  private abortController: AbortController;

  constructor(videoId: string, channelId: string, options?: MasterchatOptions) {
    super();
    this.videoId = videoId;
    this.channelId = channelId;
    this.options = options;
    this.abortController = new AbortController();
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
      throw new Error("Masterchat connection aborted by signal");
    });

    const mc = new Masterchat(this.videoId, this.channelId, this.options);

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
