import { UpdateLiveChatPollAction } from "../../interfaces/actions";
import { YTUpdateLiveChatPollAction } from "../../interfaces/yt/chat";
import { debugLog } from "../../utils";

export function parseUpdateLiveChatPollAction(
  payload: YTUpdateLiveChatPollAction
) {
  // TODO: normalize payload
  const parsed: UpdateLiveChatPollAction = {
    type: "updateLiveChatPollAction",
    ...payload["pollToUpdate"]["pollRenderer"],
  };
  return parsed;
}
