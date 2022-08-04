import { Action, UnknownAction } from "../interfaces/actions";
import { YTAction } from "../interfaces/yt/chat";
import { debugLog, omitTrackingParams } from "../utils";
import { parseAddBannerToLiveChatCommand } from "./actions/addBannerToLiveChatCommand";
import { parseAddChatItemAction } from "./actions/addChatItemAction";
import { parseAddLiveChatTickerItemAction } from "./actions/addLiveChatTickerItemAction";
import { parseCloseLiveChatActionPanelAction } from "./actions/closeLiveChatActionPanelAction";
import { parseMarkChatItemAsDeletedAction } from "./actions/markChatItemAsDeletedAction";
import { parseMarkChatItemsByAuthorAsDeletedAction } from "./actions/markChatItemsByAuthorAsDeletedAction";
import { parseRemoveBannerForLiveChatCommand } from "./actions/removeBannerForLiveChatCommand";
import { parseRemoveChatItemAction } from "./actions/removeChatItemAction";
import { parseReplaceChatItemAction } from "./actions/replaceChatItemAction";
import { parseShowLiveChatActionPanelAction } from "./actions/showLiveChatActionPanelAction";
import { parseShowLiveChatTooltipCommand } from "./actions/showLiveChatTooltipCommand";
import { parseUpdateLiveChatPollAction } from "./actions/updateLiveChatPollAction";

/**
 * Parse raw action object and returns Action
 */
export function parseAction(action: YTAction): Action | UnknownAction {
  const filteredActions = omitTrackingParams(action);
  const type = Object.keys(filteredActions)[0] as keyof typeof filteredActions;

  switch (type) {
    case "addChatItemAction":
      return parseAddChatItemAction(action[type]!);

    case "markChatItemsByAuthorAsDeletedAction":
      return parseMarkChatItemsByAuthorAsDeletedAction(action[type]!);

    case "markChatItemAsDeletedAction":
      return parseMarkChatItemAsDeletedAction(action[type]!);

    case "addLiveChatTickerItemAction":
      return parseAddLiveChatTickerItemAction(action[type]!);

    case "replaceChatItemAction":
      return parseReplaceChatItemAction(action[type]!);

    case "addBannerToLiveChatCommand":
      return parseAddBannerToLiveChatCommand(action[type]!);

    case "removeBannerForLiveChatCommand":
      return parseRemoveBannerForLiveChatCommand(action[type]!);

    case "showLiveChatTooltipCommand":
      return parseShowLiveChatTooltipCommand(action[type]!);

    case "showLiveChatActionPanelAction":
      return parseShowLiveChatActionPanelAction(action[type]!);

    case "updateLiveChatPollAction":
      return parseUpdateLiveChatPollAction(action[type]!);

    case "closeLiveChatActionPanelAction":
      return parseCloseLiveChatActionPanelAction(action[type]!);

    case "removeChatItemAction":
      return parseRemoveChatItemAction(action[type]!);

    default: {
      const _: never = type;
      debugLog(
        "[action required] Unrecognized action type:",
        JSON.stringify(action)
      );
    }
  }

  return unknown(action);
}

/** Unknown action used for unexpected payloads. You should implement an appropriate action parser as soon as you discover this action in the production.
 */
export function unknown(payload: unknown) {
  return {
    type: "unknown",
    payload,
  } as UnknownAction;
}
