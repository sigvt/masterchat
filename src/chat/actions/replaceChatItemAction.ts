import { YTReplaceChatItemAction } from "../../interfaces/yt/chat";
import { ReplaceChatItemAction } from "../../interfaces/actions";

export function parseReplaceChatItemAction(payload: YTReplaceChatItemAction) {
  // TODO: normalize payload
  // Replace chat item with placeholder or renderer
  const parsed: ReplaceChatItemAction = {
    type: "replaceChatItemAction",
    ...payload,
  };
  return parsed;
}
