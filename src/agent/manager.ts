import { EventEmitter } from "events";
import {
  Action,
  AddChatItemAction,
  ChatResponse,
  IterateChatOptions,
  MasterchatError,
  MasterchatOptions,
} from "..";
import { MasterchatAgent } from "./agent";

type VideoId = string;

interface MasterchatManagerEvents {
  data: (videoId: string, data: ChatResponse) => void;
  actions: (videoId: string, actions: Action[]) => void;
  chats: (videoId: string, chats: AddChatItemAction[]) => void;
  end: (videoId: string, reason?: string) => void;
  error: (videoId: string, error: MasterchatError | Error) => void;
}

export interface MasterchatManager {
  on<U extends keyof MasterchatManagerEvents>(
    event: U,
    listener: MasterchatManagerEvents[U]
  ): this;
  addListener<U extends keyof MasterchatManagerEvents>(
    event: U,
    listener: MasterchatManagerEvents[U]
  ): this;
  off<U extends keyof MasterchatManagerEvents>(
    event: U,
    listener: MasterchatManagerEvents[U]
  ): this;
  removeListener<U extends keyof MasterchatManagerEvents>(
    event: U,
    listener: MasterchatManagerEvents[U]
  ): this;
  emit<U extends keyof MasterchatManagerEvents>(
    event: U,
    ...args: Parameters<MasterchatManagerEvents[U]>
  ): boolean;
}

export class MasterchatManager extends EventEmitter {
  private pool: Map<VideoId, MasterchatAgent> = new Map();
  private options?: MasterchatOptions;

  constructor(options?: MasterchatOptions) {
    super();
    this.options = options;

    // ensure manager running
    new Promise<void>((resolve) =>
      setInterval(() => {
        if (this.agentCount() === 0) resolve();
      }, 10000)
    );
  }

  agentCount() {
    return this.pool.size;
  }

  has(videoId: string) {
    return this.pool.has(videoId);
  }

  /**
   * find or create MasterchatAgent for given stream.
   * always guarantees single instance for a stream.
   */
  subscribe(
    videoId: string,
    channelId: string,
    iterateOptions?: IterateChatOptions
  ): MasterchatAgent {
    if (this.has(videoId)) return this.pool.get(videoId)!;

    const agent = new MasterchatAgent(videoId, channelId, this.options);

    agent.on("end", (reason) => this._handleEnd(agent, reason));
    agent.on("error", (err) => this._handleError(agent, err));
    agent.on("actions", (actions) => {
      this._handleActions(agent, actions);
    });
    agent.on("chats", (chats) => {
      this._handleChats(agent, chats);
    });
    agent.start(iterateOptions);

    this.pool.set(videoId, agent);

    return agent;
  }

  unsubscribe(videoId: string) {
    const agent = this.pool.get(videoId);
    if (!agent) return;

    agent.stop("Unsubscribed by user");
    this.pool.delete(videoId);
  }

  private _handleActions(agent: MasterchatAgent, actions: Action[]) {
    this.emit("actions", agent.videoId, actions);
  }

  private _handleChats(agent: MasterchatAgent, chats: AddChatItemAction[]) {
    this.emit("chats", agent.videoId, chats);
  }

  private _handleEnd(agent: MasterchatAgent, reason?: string) {
    this.pool.delete(agent.videoId);
    this.emit("end", agent.videoId, reason);
  }

  private _handleError(agent: MasterchatAgent, err: MasterchatError | Error) {
    this.pool.delete(agent.videoId);
    this.emit("error", agent.videoId, err);
  }
}
