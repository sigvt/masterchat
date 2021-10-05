import { debugLog } from "../../utils";
import { YTShowLiveChatActionPanelAction } from "../../interfaces/yt/chat";
import { ShowLiveChatActionPanelAction } from "../../interfaces/actions";

export function parseShowLiveChatActionPanelAction(
  payload: YTShowLiveChatActionPanelAction
) {
  // TODO: normalize payload
  debugLog(
    "[action required] showLiveChatActionPanelAction",
    JSON.stringify(payload)
  );
  const parsed: ShowLiveChatActionPanelAction = {
    type: "showLiveChatActionPanelAction",
    ...payload["panelToShow"]["liveChatActionPanelRenderer"],
  };
  return parsed;
}
