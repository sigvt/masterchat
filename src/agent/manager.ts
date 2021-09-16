import { EventEmitter } from "events";
import {
  Action,
  AddChatItemAction,
  ChatResponse,
  IterateChatOptions,
  MasterchatError,
  MasterchatOptions,
} from "..";
import { MasterchatAgent, MasterchatAgentMetadata } from "./agent";

type VideoId = string;

interface MasterchatManagerEvents {
  data: (metadata: MasterchatAgentMetadata, data: ChatResponse) => void;
  actions: (metadata: MasterchatAgentMetadata, actions: Action[]) => void;
  chats: (
    metadata: MasterchatAgentMetadata,
    chats: AddChatItemAction[]
  ) => void;
  end: (metadata: MasterchatAgentMetadata, reason?: string) => void;
  error: (
    metadata: MasterchatAgentMetadata,
    error: MasterchatError | Error
  ) => void;
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
  }

  /**
   * resolves after every stream closed
   */
  ensure() {
    return new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        if (this.streamCount() === 0) {
          clearInterval(timer);
          resolve();
        }
      }, 5000);
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
  ): MasterchatAgent {
    if (this.has(videoId)) return this.pool.get(videoId)!;

    const agent = new MasterchatAgent(videoId, channelId, this.options);

    agent.on("end", (reason) => this._handleEnd(agent, reason));
    agent.on("error", (err) => this._handleError(agent, err));
    agent.on("data", (data) => {
      this._handleData(agent, data);
    });
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

  /**
   * stop subscribing live chat
   */
  unsubscribe(videoId: string) {
    const agent = this.pool.get(videoId);
    if (!agent) return;
    agent.stop("Unsubscribed by user"); // will emit 'end' event
  }

  private _handleData(agent: MasterchatAgent, data: ChatResponse) {
    this.emit("data", agent.metadata, data);
  }

  private _handleActions(agent: MasterchatAgent, actions: Action[]) {
    this.emit("actions", agent.metadata, actions);
  }

  private _handleChats(agent: MasterchatAgent, chats: AddChatItemAction[]) {
    this.emit("chats", agent.metadata, chats);
  }

  private _handleEnd(agent: MasterchatAgent, reason?: string) {
    this.pool.delete(agent.videoId);
    this.emit("end", agent.metadata, reason);
  }

  private _handleError(agent: MasterchatAgent, err: MasterchatError | Error) {
    this.pool.delete(agent.videoId);
    this.emit("error", agent.metadata, err);
  }
}
