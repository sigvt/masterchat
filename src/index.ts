import { Credentials } from "./auth";
import { Base } from "./base";
import { DEFAULT_API_KEY } from "./constants";
import { ChatService } from "./services/chat";
import { ChatActionService } from "./services/chatAction";
import { ContextService } from "./services/context";
import { MessageService } from "./services/message";
import { normalizeVideoId } from "./util";

export { Credentials } from "./auth";
export { MasterchatError } from "./error";
export * from "./services/chat/exports";
export * from "./services/chatAction/exports";
export * from "./services/context/exports";
export * from "./services/message/exports";
export {
  YTChatError,
  YTChatErrorStatus,
  YTEmojiRun,
  YTLiveChatTextMessageRenderer,
  YTRun,
  YTRunContainer,
  YTTextRun,
  YTThumbnail,
} from "./types/chat";
export { YTReloadContinuation } from "./types/context";
export { convertRunsToString, normalizeVideoId, timeoutThen } from "./util";

export interface MasterchatOptions {
  apiKey?: string;
  credentials?: Credentials | string;
}

// umbrella class
export class Masterchat {
  static async init(videoIdOrUrl: string, options: MasterchatOptions = {}) {
    const videoId = normalizeVideoId(videoIdOrUrl);
    const mc = new Masterchat(videoId, options);
    await mc.populateMetadata();
    // if (options.credentials) await mc.populateLiveChatContext();
    return mc;
  }

  public async setVideoId(videoIdOrUrl: string) {
    const videoId = normalizeVideoId(videoIdOrUrl);
    this.videoId = videoId;
    await this.populateMetadata();
    // if (this.credentials) await this.populateLiveChatContext();
  }

  private constructor(
    videoId: string,
    { apiKey = DEFAULT_API_KEY, credentials }: MasterchatOptions = {}
  ) {
    this.videoId = videoId;
    this.apiKey = apiKey;

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
