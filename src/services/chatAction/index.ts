/**
 * Other Actions
 *
 * Vote
 * POST /youtubei/v1/live_chat/send_live_chat_vote?key=<key>
 * body: {params}
 *
 * Context Menu Actions
 *
 * Block user
 * POST /youtubei/v1/live_chat/moderate
 * text: "Block"
 * icon: "BLOCK_USER"
 * key: menuNavigationItemRenderer.navigationEndpoint.confirmDialogEndpoint.content.confirmDialogRenderer.confirmButton.buttonRenderer.serviceEndpoint.moderateLiveChatEndpoint.params
 *
 * Unblock user
 * POST /youtubei/v1/live_chat/moderate
 * text: "Unblock"
 * icon: "BLOCK_USER"
 * key: menuServiceItemRenderer.serviceEndpoint.moderateLiveChatEndpoint.params
 *
 * Report message
 * POST /youtubei/v1/flag/get_form?key=<key>
 * text: "Report"
 * icon: "FLAG"
 * key: menuServiceItemRenderer.serviceEndpoint.getReportFormEndpoint.params
 *
 * Pin message
 * POST /youtubei/v1/live_chat/live_chat_action?key=<key>
 * text: "Pin message"
 * icon: "KEEP"
 * key: liveChatActionEndpoint
 *
 * Unpin message
 * POST /youtubei/v1/live_chat/live_chat_action?key=<key>
 * text: Unpin message
 * icon: KEEP_OFF
 * key: liveChatActionEndpoint
 *
 * Remove message
 * POST /youtubei/v1/live_chat/moderate?key=<key>
 * text: "Remove"
 * icon: "DELETE"
 * key: moderateLiveChatEndpoint
 *
 * Put user in timeout
 * POST /youtubei/v1/live_chat/moderate?key=<key>
 * text: "Put user in timeout"
 * icon: "HOURGLASS"
 * key: moderateLiveChatEndpoint
 *
 * Hide user on this channel
 * POST /youtubei/v1/live_chat/moderate?key=<key>
 * text: "Hide user on this channel"
 * icon: "REMOVE_CIRCLE"
 * key: moderateLiveChatEndpoint
 *
 * Unhide user on this channel
 * POST /youtubei/v1/live_chat/moderate?key=<key>
 * text: Unhide user on this channel
 * icon: ADD_CIRCLE
 * key: moderateLiveChatEndpoint
 *
 * Add moderator
 * POST /youtubei/v1/live_chat/manage_user?key=<key>
 * text: "Add moderator"
 * icon: "ADD_MODERATOR"
 * key: manageLiveChatUserEndpoint
 *
 * Remove moderator
 * POST /youtubei/v1/live_chat/manage_user?key=<key>
 * text: Remove moderator
 * icon: REMOVE_MODERATOR
 * key: manageLiveChatUserEndpoint
 */

import { Base } from "../../base";
import {
  YTAction,
  YTGetItemContextMenuResponse,
  YTLiveChatServiceEndpointContainer,
} from "../../types/chat";
import { withContext } from "../../util";
import { ActionCatalog, ActionInfo } from "./exports";

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

function buildMeta(endpoint: YTLiveChatServiceEndpointContainer) {
  return {
    isPost: endpoint.commandMetadata.webCommandMetadata.sendPost,
    url: endpoint.commandMetadata.webCommandMetadata.apiUrl,
    params: findParams(endpoint)!,
  };
}

export interface ChatActionService extends Base {}
export class ChatActionService {
  // TODO: narrow down return type
  async report(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.report;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async block(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.block;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async unblock(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.unblock;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async pin(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.pin;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async unpin(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.unpin;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  async remove(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.remove;
    if (!actionInfo) return;
    const res = await this.sendAction(actionInfo);
    return res[0].markChatItemAsDeletedAction;
  }

  // TODO: narrow down return type
  async timeout(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.timeout;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async hide(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.hide;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async unhide(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.unhide;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async addModerator(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.addModerator;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  // TODO: narrow down return type
  async removeModerator(contextMenuEndpointParams: string) {
    const catalog = await this.getActionCatalog(contextMenuEndpointParams);
    const actionInfo = catalog?.removeModerator;
    if (!actionInfo) return;
    return await this.sendAction(actionInfo);
  }

  private async sendAction<T = YTAction[]>(actionInfo: ActionInfo): Promise<T> {
    const url = actionInfo.url;
    let res;
    if (actionInfo.isPost) {
      res = await this.post(url, {
        body: JSON.stringify(
          withContext({
            params: actionInfo.params,
          })
        ),
      });
    } else {
      res = await this.get(url);
    }
    const json = await res.json();
    if (!json.success) {
      throw new Error(`Failed to perform action: ` + JSON.stringify(json));
    }
    return json.actions;
  }

  /**
   * NOTE: urlParams: pbj=1|0
   */
  private async getActionCatalog(
    contextMenuEndpointParams: string
  ): Promise<ActionCatalog | undefined> {
    const query = new URLSearchParams({
      params: contextMenuEndpointParams,
    });
    const endpoint =
      "/youtubei/v1/live_chat/get_item_context_menu?" + query.toString();
    const res = await this.post(endpoint, {
      body: JSON.stringify(withContext()),
    });
    const response = (await res.json()) as YTGetItemContextMenuResponse;

    if (response.error) {
      // TODO: handle this
      // {
      //   "error": {
      //     "code": 400,
      //     "message": "Precondition check failed.",
      //     "errors": [
      //       {
      //         "message": "Precondition check failed.",
      //         "domain": "global",
      //         "reason": "failedPrecondition"
      //       }
      //     ],
      //     "status": "FAILED_PRECONDITION"
      //   }
      // }
      return undefined;
    }

    let items: ActionCatalog = {};
    for (const item of response.liveChatItemContextMenuSupportedRenderers!
      .menuRenderer.items) {
      const rdr =
        item.menuServiceItemRenderer ?? item.menuNavigationItemRenderer!;
      const text = rdr.text.runs[0].text;

      switch (text) {
        case "Report": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.report = buildMeta(endpoint);
          break;
        }
        case "Block": {
          const endpoint =
            item.menuNavigationItemRenderer!.navigationEndpoint
              .confirmDialogEndpoint!.content.confirmDialogRenderer
              .confirmButton.buttonRenderer.serviceEndpoint;
          items.block = buildMeta(endpoint);
          break;
        }
        case "Unblock": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.unblock = buildMeta(endpoint);
          break;
        }
        case "Pin message": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.pin = buildMeta(endpoint);
          break;
        }
        case "Unpin message": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.unpin = buildMeta(endpoint);
          break;
        }
        case "Remove": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.remove = buildMeta(endpoint);
          break;
        }
        case "Put user in timeout": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.timeout = buildMeta(endpoint);
          break;
        }
        case "Hide user on this channel": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.hide = buildMeta(endpoint);
          break;
        }
        case "Unhide user on this channel": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.unhide = buildMeta(endpoint);
          break;
        }
        case "Add moderator": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.addModerator = buildMeta(endpoint);
          break;
        }
        case "Remove moderator": {
          const endpoint = item.menuServiceItemRenderer!.serviceEndpoint;
          items.removeModerator = buildMeta(endpoint);
          break;
        }
      }
    }
    return items;
  }
}
