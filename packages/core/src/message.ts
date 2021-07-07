import fetch from "node-fetch";
import { Credentials, DEFAULT_CLIENT, withAuthHeader } from "./auth";
import { LiveChatParams } from "./context";
import { log } from "./util";

export interface SendMessageOptions {
  apiKey: string;
  credentials: Credentials;
  params: LiveChatParams;
}
export async function sendMessage(
  message: string,
  { apiKey, credentials, params }: SendMessageOptions
) {
  const body = {
    richMessage: {
      textSegments: [
        {
          text: message,
        },
      ],
    },
    context: {
      client: DEFAULT_CLIENT,
    },
    params: params.sendMessageParams,
  };

  const headers = withAuthHeader(credentials, {
    "content-type": "application/json",
  });

  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/live_chat/send_message?key=" + apiKey,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );
  const json = await res.json();
  return json;
}
