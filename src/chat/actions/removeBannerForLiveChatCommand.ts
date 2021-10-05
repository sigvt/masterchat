import { YTRemoveBannerForLiveChatCommand } from "../../interfaces/yt/chat";
import { RemoveBannerAction } from "../../interfaces/actions";

export function parseRemoveBannerForLiveChatCommand(
  payload: YTRemoveBannerForLiveChatCommand
) {
  // TODO: normalize payload
  // remove pinned item
  const parsed: RemoveBannerAction = {
    type: "removeBannerAction",
    ...payload,
  };
  return parsed;
}
