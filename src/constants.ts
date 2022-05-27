import { hextou8 } from "./protobuf/util";

function h(b: TemplateStringsArray): string {
  return new TextDecoder().decode(hextou8(b.raw[0]));
}

export const DH = {
  "Accept-Language": "en",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
};
export const DC = { clientName: "WEB", clientVersion: "2.20211014.05.00" };

export const DO = "https://www.youtube.com";
export const DAK = h`41497a615379414f5f464a32536c7155385134535445484c4743696c775f59395f313171635738`;
export const EP_GLCR = "/youtubei/v1/live_chat/get_live_chat_replay?key=" + DAK;
export const EP_GLC = "/youtubei/v1/live_chat/get_live_chat?key=" + DAK;
export const EP_SM = "/youtubei/v1/live_chat/send_message?key=" + DAK;
export const EP_MOD = "/youtubei/v1/live_chat/moderate?key=" + DAK;
export const EP_LCA = "/youtubei/v1/live_chat/live_chat_action?key=" + DAK;
export const EP_MU = "/youtubei/v1/live_chat/manage_user?key=" + DAK;
export const EP_GTS = "/youtubei/v1/get_transcript?key=" + DAK;
export const EP_NXT = "/youtubei/v1/next?key=" + DAK;
export const EP_GICM =
  "/youtubei/v1/live_chat/get_item_context_menu?key=" + DAK;

export const SASH = "SAPISIDHASH";
export const XO = "X-Origin";
export const XGAU = "X-Goog-AuthUser";
export const XGPID = "X-Goog-PageId";
