/**
 * Other Actions
 *
 * Vote
 * POST <yiv1>/live_chat/send_live_chat_vote?key=<key>
 * body: {params}
 *
 * Context Menu Actions
 *
 * Block user
 * POST <yiv1>/live_chat/moderate
 * text: "Block"
 * icon: "BLOCK_USER"
 * key: menuNavigationItemRenderer.navigationEndpoint.confirmDialogEndpoint.content.confirmDialogRenderer.confirmButton.buttonRenderer.serviceEndpoint.moderateLiveChatEndpoint.params
 *
 * Unblock user
 * POST <yiv1>/live_chat/moderate
 * text: "Unblock"
 * icon: "BLOCK_USER"
 * key: menuServiceItemRenderer.serviceEndpoint.moderateLiveChatEndpoint.params
 *
 * Report message
 * POST <yiv1>/flag/get_form?key=<key>
 * text: "Report"
 * icon: "FLAG"
 * key: menuServiceItemRenderer.serviceEndpoint.getReportFormEndpoint.params
 *
 * Pin message
 * POST <yiv1>/live_chat/live_chat_action?key=<key>
 * text: "Pin message"
 * icon: "KEEP"
 * key: liveChatActionEndpoint
 *
 * Unpin message
 * POST <yiv1>/live_chat/live_chat_action?key=<key>
 * text: Unpin message
 * icon: KEEP_OFF
 * key: liveChatActionEndpoint
 *
 * Remove message
 * POST <yiv1>/live_chat/moderate?key=<key>
 * text: "Remove"
 * icon: "DELETE"
 * key: moderateLiveChatEndpoint
 *
 * Put user in timeout
 * POST <yiv1>/live_chat/moderate?key=<key>
 * text: "Put user in timeout"
 * icon: "HOURGLASS"
 * key: moderateLiveChatEndpoint
 *
 * Hide user on this channel
 * POST <yiv1>/live_chat/moderate?key=<key>
 * text: "Hide user on this channel"
 * icon: "REMOVE_CIRCLE"
 * key: moderateLiveChatEndpoint
 *
 * Unhide user on this channel
 * POST <yiv1>/live_chat/moderate?key=<key>
 * text: Unhide user on this channel
 * icon: ADD_CIRCLE
 * key: moderateLiveChatEndpoint
 *
 * Add moderator
 * POST <yiv1>/live_chat/manage_user?key=<key>
 * text: "Add moderator"
 * icon: "ADD_MODERATOR"
 * key: manageLiveChatUserEndpoint
 *
 * Remove moderator
 * POST <yiv1>/live_chat/manage_user?key=<key>
 * text: Remove moderator
 * icon: REMOVE_MODERATOR
 * key: manageLiveChatUserEndpoint
 */

import { YTLiveChatServiceEndpointContainer } from "../interfaces/yt/chat";

function findParams(obj: any): string | undefined {
  const keys = Object.keys(obj).filter(
    (key) => !["clickTrackingParams", "commandMetadata"].includes(key)
  );

  const key = keys[0];

  if (key === "confirmDialogEndpoint") {
    return findParams(
      obj[keys[0]].content.confirmDialogRenderer.confirmButton.buttonRenderer
        .serviceEndpoint
    );
  }

  const params = obj[key]?.params as string | undefined;
  return params;
}

export function buildMeta(endpoint: YTLiveChatServiceEndpointContainer) {
  return {
    isPost: endpoint.commandMetadata.webCommandMetadata.sendPost,
    url: endpoint.commandMetadata.webCommandMetadata.apiUrl,
    params: findParams(endpoint)!,
  };
}
