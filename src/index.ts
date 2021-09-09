import { Credentials } from "./auth";
import { Base } from "./base";
import { DAK } from "./constants";
import { ChatService } from "./services/chat";
import { ChatActionService } from "./services/chatAction";
import { ContextService, fetchMetadata } from "./services/context";
import { MessageService } from "./services/message";
import { normalizeVideoId } from "./utils";

export { Credentials } from "./auth";
export { MasterchatError } from "./error";
export * from "./services/chat/types";
export * from "./services/chatAction/types";
export { fetchMetadata, fetchMetadataFromEmbed } from "./services/context";
export * from "./services/context/types";
export * from "./services/message/types";
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
export { runsToString, normalizeVideoId, timeoutThen } from "./utils";

export interface MasterchatOptions {
  credentials?: Credentials | string;
}

// umbrella class
export class Masterchat {
  /**
   * Useful when you don't know channelId
   */
  static async init(videoIdOrUrl: string, options: MasterchatOptions = {}) {
    const videoId = normalizeVideoId(videoIdOrUrl);
    const metadata = await fetchMetadata(videoId);
    const mc = new Masterchat(videoId, metadata.channelId, options);
    mc.metadata = metadata;
    mc.isReplay = !metadata.isLive;
    return mc;
  }

  /**
   * Much faster than Masterchat.init
   */
  constructor(
    videoId: string,
    channelId: string,
    { credentials }: MasterchatOptions = {}
  ) {
    this.videoId = videoId;
    this.channelId = channelId;
    this.apiKey = DAK;
    this.metadata = undefined;
    this.isReplay = undefined;

    if (typeof credentials === "string") {
      credentials = JSON.parse(
        Buffer.from(credentials, "base64").toString()
      ) as Credentials;
    }

    this.credentials = credentials;
  }
}

// merge service classes
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
