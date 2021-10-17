import { ShowTooltipAction } from "../../interfaces/actions";
import { YTShowLiveChatTooltipCommand } from "../../interfaces/yt/chat";

export function parseShowLiveChatTooltipCommand(
  payload: YTShowLiveChatTooltipCommand
) {
  const rdr = payload["tooltip"]["tooltipRenderer"];

  const parsed: ShowTooltipAction = {
    type: "showTooltipAction",
    // live-chat-banner
    targetId: rdr.targetId,
    // { "runs": [{ "text": "Click to show less" }] }
    detailsText: rdr.detailsText,
    // TOOLTIP_POSITION_TYPE_BELOW
    suggestedPosition: rdr.suggestedPosition.type,
    // TOOLTIP_DISMISS_TYPE_TAP_ANYWHERE
    dismissStrategy: rdr.dismissStrategy.type,
    promoConfig: rdr.promoConfig,
    dwellTimeMs: rdr.dwellTimeMs ? parseInt(rdr.dwellTimeMs, 10) : undefined,
  };

  return parsed;
}
