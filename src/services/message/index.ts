import { Base } from "../../base";
import { withContext } from "../../util";

export interface MessageService extends Base {}
export class MessageService {
  async sendMessage(message: string) {
    const params = this.liveChatContext?.sendMessageParams;
    if (!params) return { error: "NO_PARAMS" };

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

    const res = await this.post("/youtubei/v1/live_chat/send_message", {
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return json;
  }
}
