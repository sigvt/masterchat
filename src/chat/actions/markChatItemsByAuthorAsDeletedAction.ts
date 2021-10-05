import { YTMarkChatItemsByAuthorAsDeletedAction } from "../../interfaces/yt/chat";
import { MarkChatItemsByAuthorAsDeletedAction } from "../../interfaces/actions";

export function parseMarkChatItemsByAuthorAsDeletedAction(
  payload: YTMarkChatItemsByAuthorAsDeletedAction
): MarkChatItemsByAuthorAsDeletedAction {
  return {
    type: "markChatItemsByAuthorAsDeletedAction",
    channelId: payload.externalChannelId,
    timestamp: new Date(),
  };
}
