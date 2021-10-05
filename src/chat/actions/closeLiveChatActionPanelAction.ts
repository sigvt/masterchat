import { debugLog } from "../../utils";
import { YTCloseLiveChatActionPanelAction } from "../../interfaces/yt/chat";
import { CloseLiveChatActionPanelAction } from "../../interfaces/actions";

export function parseCloseLiveChatActionPanelAction(
  payload: YTCloseLiveChatActionPanelAction
) {
  // TODO: normalize payload
  debugLog(
    "[action required] closeLiveChatActionPanelAction",
    JSON.stringify(payload)
  );
  const parsed: CloseLiveChatActionPanelAction = {
    type: "closeLiveChatActionPanelAction",
    ...payload,
  };
  return parsed;
}
