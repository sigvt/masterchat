import { Base } from "../../base";
import { smp } from "../../protobuf/assembler";
import { debugLog, withContext } from "../../utils";
import { YTActionResponse, YTLiveChatTextMessageRenderer } from "../../yt/chat";

export interface MessageService extends Base {}

export class MessageService {
  async sendMessage(message: string): Promise<YTLiveChatTextMessageRenderer> {
    const params = smp(this.cvPair());

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

    const res = await this.postWithRetry<YTActionResponse>(
      "/youtubei/v1/live_chat/send_message",
      {
        body: JSON.stringify(body),
      }
    );

    const item = res.actions?.[0].addChatItemAction?.item;
    if (!(item && "liveChatTextMessageRenderer" in item)) {
      throw new Error(`Invalid response: ` + item);
    }
    return item.liveChatTextMessageRenderer;
  }
}
