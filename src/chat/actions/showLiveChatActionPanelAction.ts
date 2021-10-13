import { debugLog } from "../../utils";
import {
  YTLiveChatPollRenderer,
  YTShowLiveChatActionPanelAction,
} from "../../interfaces/yt/chat";
import {
  ShowLiveChatActionPanelAction,
  ShowPollPanelAction,
} from "../../interfaces/actions";
import { pickThumbUrl } from "../utils";

export function parseShowLiveChatActionPanelAction(
  payload: YTShowLiveChatActionPanelAction
) {
  const panelRdr = payload.panelToShow.liveChatActionPanelRenderer;
  const rendererType = Object.keys(panelRdr.contents)[0];
  switch (rendererType) {
    case "pollRenderer": {
      const rdr = panelRdr.contents.pollRenderer as YTLiveChatPollRenderer;

      const parsed: ShowPollPanelAction = {
        type: "showPollPanelAction",
        id: panelRdr.id,
        targetId: panelRdr.targetId,
        choices: rdr.choices,
        question: rdr.header.pollHeaderRenderer.pollQuestion.simpleText,
        authorName: rdr.header.pollHeaderRenderer.metadataText.runs[0].text,
        authorPhoto: pickThumbUrl(rdr.header.pollHeaderRenderer.thumbnail),
        pollType: rdr.header.pollHeaderRenderer.liveChatPollType,
      };

      return parsed;
    }
    default: {
      debugLog(
        "[action required] unrecognized rendererType (showLiveChatActionPanelAction):",
        JSON.stringify(payload)
      );
    }
  }

  const parsed: ShowLiveChatActionPanelAction = {
    type: "showLiveChatActionPanelAction",
    panelToShow: payload.panelToShow,
  };
  return parsed;
}
