import { RemoveChatItemAction } from "../../interfaces/actions";
import { YTRemoveChatItemAction } from "../../interfaces/yt/chat";

export function parseRemoveChatItemAction(payload: YTRemoveChatItemAction) {
  const parsed: RemoveChatItemAction = {
    type: "removeChatItemAction",
    targetId: payload.targetItemId,
    timestamp: new Date(),
  };
  return parsed;
}
