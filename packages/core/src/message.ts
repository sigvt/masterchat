import fetch from "node-fetch";
import { Credentials, DEFAULT_CLIENT, withAuthHeader } from "./auth";
import { log } from "./util";

export interface SendMessageOptions {
  apikey: string;
  creds: Credentials;
  params: string;
}
export async function sendMessage(
  message: string,
  { apikey, creds, params }: SendMessageOptions
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
    params,
  };

  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/live_chat/send_message?key=" + apikey,
    {
      method: "POST",
      headers: withAuthHeader(creds),
      body: JSON.stringify(body),
    }
  );
  log(res);
  return res;
}
