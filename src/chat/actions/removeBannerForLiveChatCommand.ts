import { RemoveBannerAction } from "../../interfaces/actions";
import { YTRemoveBannerForLiveChatCommand } from "../../interfaces/yt/chat";

export function parseRemoveBannerForLiveChatCommand(
  payload: YTRemoveBannerForLiveChatCommand
) {
  // remove pinned item
  const parsed: RemoveBannerAction = {
    type: "removeBannerAction",
    targetActionId: payload.targetActionId,
  };
  return parsed;
}
