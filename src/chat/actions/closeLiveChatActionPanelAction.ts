import { CloseLiveChatActionPanelAction } from "../../interfaces/actions";
import { YTCloseLiveChatActionPanelAction } from "../../interfaces/yt/chat";

export function parseCloseLiveChatActionPanelAction(
  payload: YTCloseLiveChatActionPanelAction
) {
  const parsed: CloseLiveChatActionPanelAction = {
    type: "closeLiveChatActionPanelAction",
    targetPanelId: payload.targetPanelId,
    skipOnDismissCommand: payload.skipOnDismissCommand,
  };
  return parsed;
}
