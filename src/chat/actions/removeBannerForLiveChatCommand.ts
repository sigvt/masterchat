import { YTRemoveBannerForLiveChatCommand } from "../../interfaces/yt/chat";
import { RemoveBannerAction } from "../../interfaces/actions";

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
