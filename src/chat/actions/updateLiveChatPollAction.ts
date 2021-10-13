import { UpdateLiveChatPollAction } from "../../interfaces/actions";
import { YTUpdateLiveChatPollAction } from "../../interfaces/yt/chat";
import { debugLog } from "../../utils";

export function parseUpdateLiveChatPollAction(
  payload: YTUpdateLiveChatPollAction
) {
  debugLog(
    "[action required] updateLiveChatPollAction",
    JSON.stringify(payload)
  );
  // TODO: normalize payload
  const parsed: UpdateLiveChatPollAction = {
    type: "updateLiveChatPollAction",
    ...payload["pollToUpdate"]["pollRenderer"],
  };
  return parsed;
}
