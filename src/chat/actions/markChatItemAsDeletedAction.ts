import { MarkChatItemAsDeletedAction } from "../../interfaces/actions";
import { YTMarkChatItemAsDeletedAction } from "../../interfaces/yt/chat";
import { debugLog } from "../../utils";

export function parseMarkChatItemAsDeletedAction(
  payload: YTMarkChatItemAsDeletedAction
) {
  const statusText = payload.deletedStateMessage.runs[0].text;
  // {"deletedStateMessage":{"runs":[{"text":"Message deleted by "},{"text":"uetchy","bold":true},{"text":"."}]},"targetItemId":"Ch4KGkNONjBtTHZWX1BjQ0ZSTUNyUVlkclZBRnlREgA%3D","showOriginalContentMessage":{"runs":[{"text":"View deleted message","italics":true}]}
  // [{"text":"Message deleted by "},{"text":"uetchy","bold":true},{"text":"."}]
  switch (statusText) {
    case "[message retracted]":
    case "[message deleted]":
    case "Message deleted by ":
      break;
    default:
      debugLog(
        "[action required] Unrecognized deletion status:",
        statusText,
        JSON.stringify(payload)
      );
  }

  const executor =
    statusText === "Message deleted by "
      ? payload.deletedStateMessage.runs[1].text
      : undefined;

  const retracted = statusText === "[message retracted]";

  const parsed: MarkChatItemAsDeletedAction = {
    type: "markChatItemAsDeletedAction",
    retracted,
    targetId: payload.targetItemId,
    executor,
    timestamp: new Date(),
  };
  return parsed;
}
