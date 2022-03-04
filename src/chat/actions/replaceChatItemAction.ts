import { ReplaceChatItemAction } from "../../interfaces/actions";
import { YTReplaceChatItemAction } from "../../interfaces/yt/chat";
import { debugLog } from "../../utils";
import {
  parseLiveChatPaidMessageRenderer,
  parseLiveChatPlaceholderItemRenderer,
  parseLiveChatTextMessageRenderer,
} from "./addChatItemAction";

export function parseReplaceChatItemAction(payload: YTReplaceChatItemAction) {
  const parsedItem = parseReplacementItem(payload.replacementItem);

  const parsed: ReplaceChatItemAction = {
    type: "replaceChatItemAction",
    targetItemId: payload.targetItemId,
    replacementItem: parsedItem,
  };
  return parsed;
}

function parseReplacementItem(
  item: YTReplaceChatItemAction["replacementItem"]
) {
  if ("liveChatPlaceholderItemRenderer" in item) {
    return parseLiveChatPlaceholderItemRenderer(
      item.liveChatPlaceholderItemRenderer
    );
  } else if ("liveChatTextMessageRenderer" in item) {
    return parseLiveChatTextMessageRenderer(item.liveChatTextMessageRenderer);
  } else if ("liveChatPaidMessageRenderer" in item) {
    // TODO: check if YTLiveChatPaidMessageRendererContainer will actually appear
    debugLog(
      "[action required] observed liveChatPaidMessageRenderer as a replacementItem"
    );
    return parseLiveChatPaidMessageRenderer(item.liveChatPaidMessageRenderer);
  } else {
    debugLog(
      "[action required] unrecognized replacementItem type:",
      JSON.stringify(item)
    );
    return item;
  }
}
