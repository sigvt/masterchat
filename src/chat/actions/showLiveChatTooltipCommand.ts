import { YTShowLiveChatTooltipCommand } from "../../interfaces/yt/chat";
import { ShowTooltipAction } from "../../interfaces/actions";

export function parseShowLiveChatTooltipCommand(
  payload: YTShowLiveChatTooltipCommand
) {
  // TODO: normalize payload
  const parsed: ShowTooltipAction = {
    type: "showTooltipAction",
    ...payload["tooltip"]["tooltipRenderer"],
  };
  return parsed;
}
