import { Credentials } from "./auth";
import { Base } from "./base";
import { DAK } from "./constants";
import { InvalidArgumentError } from "./error";
import { ChatService } from "./services/chat";
import { ChatActionService } from "./services/chatAction";
import { ContextService } from "./services/context";
import { MessageService } from "./services/message";
import { toVideoId } from "./utils";

export { MasterchatAgent, MasterchatAgentMetadata } from "./agent/agent";
export { MasterchatManager } from "./agent/manager";
export { Credentials } from "./auth";
export * from "./error";
export * as protobuf from "./protobuf";
export * from "./services/chat/types";
export * from "./services/chatAction/types";
export * from "./services/context/types";
export * from "./services/message/types";
export { runsToString, timeoutThen, toVideoId } from "./utils";
export {
  YTChatError,
  YTChatErrorStatus,
  YTEmoji,
  YTEmojiRun,
  YTLiveChatTextMessageRenderer,
  YTRun,
  YTRunContainer,
  YTTextRun,
  YTThumbnail,
  YTThumbnailListWithAccessibility,
} from "./yt/chat";
export { YTAccessibilityData, YTReloadContinuation } from "./yt/context";

export interface MasterchatOptions {
  /** you can grab Credentials using `extra/credential-fetcher` */
  credentials?: Credentials | string;

  /** set live stream type
   *
   * ```
   * if undefined,
   *   live -> OK
   *   archive -> first request fails, then try fetching replay chat -> OK
   *
   * if set true:
   *   live -> OK
   *   archive -> throw DisabledChatError
   *
   * if set false:
   *   live -> throw DisabledChatError
   *   archive -> OK
   * ```
   */
  isLive?: boolean;
}

// umbrella class
export class Masterchat {
  /**
   * Useful when you don't know channelId or isLive status
   */
  static async init(videoIdOrUrl: string, options: MasterchatOptions = {}) {
    const videoId = toVideoId(videoIdOrUrl);
    if (!videoId) {
      throw new InvalidArgumentError(
        `Failed to extract video id: ${videoIdOrUrl}`
      );
    }
    // set channelId "" as populateMetadata will fill out it anyways
    const mc = new Masterchat(videoId, "", {
      ...options,
    });
    await mc.populateMetadata();
    return mc;
  }

  /**
   * Much faster than Masterchat.init
   */
  constructor(
    videoId: string,
    channelId: string,
    { isLive, credentials }: MasterchatOptions = {}
  ) {
    this.videoId = videoId;
    this.channelId = channelId;
    this.isLive = isLive;
    this.apiKey = DAK;

    if (typeof credentials === "string") {
      credentials = JSON.parse(
        Buffer.from(credentials, "base64").toString()
      ) as Credentials;
    }

    this.credentials = credentials;
  }
}

export interface Masterchat
  extends Base,
    ContextService,
    ChatService,
    ChatActionService,
    MessageService {}

applyMixins(Masterchat, [
  Base,
  ContextService,
  ChatService,
  ChatActionService,
  MessageService,
]);

// taken from TypeScript docs
// https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}
