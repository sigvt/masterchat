import { YTReplaceChatItemAction } from "../../interfaces/yt/chat";
import { ReplaceChatItemAction } from "../../interfaces/actions";
import { debugLog } from "../../utils";

const KNOWN_ITEM_TYPES = [
  "liveChatTextMessageRenderer",
  "liveChatPlaceholderItemRenderer",
];

export function parseReplaceChatItemAction(payload: YTReplaceChatItemAction) {
  // TODO: normalize payload
  // Replace chat item with placeholder or renderer
  const itemType = Object.keys(payload.replacementItem)[0];
  if (!KNOWN_ITEM_TYPES.includes(itemType)) {
    debugLog(
      "[action required] unrecognized replacementItem:",
      JSON.stringify(payload)
    );
  }

  const parsed: ReplaceChatItemAction = {
    type: "replaceChatItemAction",
    ...payload,
  };
  return parsed;
}
