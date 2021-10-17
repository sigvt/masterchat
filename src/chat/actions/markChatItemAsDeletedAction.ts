import { MarkChatItemAsDeletedAction } from "../../interfaces/actions";
import { YTMarkChatItemAsDeletedAction } from "../../interfaces/yt/chat";
import { debugLog } from "../../utils";

export function parseMarkChatItemAsDeletedAction(
  payload: YTMarkChatItemAsDeletedAction
) {
  const statusText = payload.deletedStateMessage.runs[0].text;
  switch (statusText) {
    case "[message retracted]":
    case "[message deleted]":
      break;
    default:
      debugLog(
        "[action required] Unrecognized deletion status:",
        statusText,
        JSON.stringify(payload)
      );
      throw new Error(
        `Unrecognized deletion status: ${payload.deletedStateMessage}`
      );
  }

  const retracted = statusText === "[message retracted]";

  const parsed: MarkChatItemAsDeletedAction = {
    type: "markChatItemAsDeletedAction",
    retracted,
    targetId: payload.targetItemId,
    timestamp: new Date(),
  };
  return parsed;
}
