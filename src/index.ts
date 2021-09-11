import { Credentials } from "./auth";
import { Base } from "./base";
import { DAK } from "./constants";
import { ChatService } from "./services/chat";
import { ChatActionService } from "./services/chatAction";
import { ContextService } from "./services/context";
import { MessageService } from "./services/message";
import { normalizeVideoId } from "./utils";

export { Credentials } from "./auth";
export * from "./error";
export * from "./services/chat/types";
export * from "./services/chatAction/types";
export * from "./services/context/types";
export * from "./services/message/types";
export { normalizeVideoId, runsToString, timeoutThen } from "./utils";
export {
  YTChatError,
  YTChatErrorStatus,
  YTEmojiRun,
  YTLiveChatTextMessageRenderer,
  YTRun,
  YTRunContainer,
  YTTextRun,
  YTThumbnail,
} from "./yt/chat";
export { YTReloadContinuation } from "./yt/context";

export interface MasterchatOptions {
  /** you can grab Credentials using `extra/credential-fetcher` */
  credentials?: Credentials | string;

  sessionId?: string;

  isLive?: boolean;
}

// umbrella class
export class Masterchat {
  /**
   * Useful when you don't know channelId
   */
  static async init(videoIdOrUrl: string, options: MasterchatOptions = {}) {
    const videoId = normalizeVideoId(videoIdOrUrl);
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
    { isLive, credentials, sessionId }: MasterchatOptions = {}
  ) {
    this.videoId = videoId;
    this.channelId = channelId;
    this.isLive = isLive;
    this.apiKey = DAK;
    this.sessionId = sessionId;

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
