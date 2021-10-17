import { MarkChatItemsByAuthorAsDeletedAction } from "../../interfaces/actions";
import { YTMarkChatItemsByAuthorAsDeletedAction } from "../../interfaces/yt/chat";

export function parseMarkChatItemsByAuthorAsDeletedAction(
  payload: YTMarkChatItemsByAuthorAsDeletedAction
): MarkChatItemsByAuthorAsDeletedAction {
  return {
    type: "markChatItemsByAuthorAsDeletedAction",
    channelId: payload.externalChannelId,
    timestamp: new Date(),
  };
}
