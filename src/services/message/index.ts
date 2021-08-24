import { Base } from "../../base";
import {
  YTActionResponse,
  YTLiveChatTextMessageRenderer,
} from "../../types/chat";
import { withContext } from "../../util";

/**
 * returns undefined if unauthorized
 */
export interface MessageService extends Base {}
export class MessageService {
  async sendMessage(
    message: string
  ): Promise<YTLiveChatTextMessageRenderer | undefined> {
    const params = this.liveChatContext?.sendMessageParams;
    if (!params) return undefined;

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

    const res = await this.postJson<YTActionResponse>(
      "/youtubei/v1/live_chat/send_message",
      {
        body: JSON.stringify(body),
      }
    );
    if (!res.success) {
      throw new Error(`Failed to send message: ` + JSON.stringify(res));
    }
    const item = res.actions[0].addChatItemAction?.item;
    if (!(item && "liveChatTextMessageRenderer" in item)) {
      throw new Error(`Invalid response: ` + item);
    }
    return item.liveChatTextMessageRenderer;
  }
}
