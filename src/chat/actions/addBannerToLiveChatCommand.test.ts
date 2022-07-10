import assert from "assert";
import { YTAddBannerToLiveChatCommand } from "../../interfaces/yt/chat";
import { parseAddBannerToLiveChatCommand } from "./addBannerToLiveChatCommand";

it("can parse product item", () => {
  const payload: YTAddBannerToLiveChatCommand = {
    bannerRenderer: {
      liveChatBannerRenderer: {
        header: {
          liveChatBannerHeaderRenderer: {
            icon: { iconType: "KEEP" },
            text: { runs: [{ text: "Pinned by " }, { text: "Koro" }] },
            contextMenuButton: {
              buttonRenderer: {
                icon: { iconType: "MORE_VERT" },
                // accessibility: { label: "Chat actions" },
                trackingParams: "CBQQ8FsiEwi859rhz8L4AhX78UwCHcdfD8A=",
                accessibilityData: {
                  accessibilityData: { label: "Chat actions" },
                },
                command: {
                  clickTrackingParams: "CBQQ8FsiEwi859rhz8L4AhX78UwCHcdfD8A=",
                  commandMetadata: {
                    webCommandMetadata: { ignoreNavigation: true },
                  },
                  liveChatItemContextMenuEndpoint: {
                    params:
                      "Q2g0S0hBb2FRMHhxZDIxTlUyNTNkbWREUm1GSlVuSlJXV1JrZGtGRWVHY2FLU29uQ2hoVlEyNUNSSGxhVTIweFV6SlZSbmRuZWtONVNXSkRVV2NTQzNsNWJGRnVYMUZXVVdjMElBRW9BVElhQ2hoVlEyNUNSSGxhVTIweFV6SlZSbmRuZWtONVNXSkRVV2M0QVVnQVVCbyUzRA==",
                  },
                },
              },
            },
          },
        },
        contents: {
          liveChatProductItemRenderer: {
            title: "Everything Fox",
            accessibilityTitle:
              "Everything Fox, €34.61 (taxes included) + additional fees, from Spring",
            thumbnail: {
              thumbnails: [
                {
                  url: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTOBfJPOybR0a6IGvRBF2q6m-iD-DS24fETWp_v_5p6ulUsLZV2wPFzVGjE79CFkqIQm7x2MfjX",
                  width: 512,
                  height: 512,
                },
              ],
            },
            price: "€34.61",
            vendorName: "Spring",
            fromVendorText: "From Spring",
            informationButton: {
              buttonRenderer: {
                icon: { iconType: "INFO" },
                accessibility: { label: "Why this merchandise?" },
                trackingParams: "CBMQ8FsiEwi859rhz8L4AhX78UwCHcdfD8A=",
              },
            },
            onClickCommand: {
              clickTrackingParams: "CBAQ-fgEGAAiEwi859rhz8L4AhX78UwCHcdfD8A=",
              commandMetadata: {
                webCommandMetadata: {
                  url: "https://www.youtube.com/redirect?event=product_shelf&redir_token=QUFFLUhqbms2QnZNUGRuVWh4VmxJdWpOcUJiNGoteXg4UXxBQ3Jtc0tuczBkVjdxaVVSN1ZBTG5wc2x3dkZiOS1kVjRqRjQwdlRvVm9wWEdHT2JzY1BxT0k2cU9vSG1xMFRlQUE2SVE4ZmlwamxmS0hkLWJIR0tWTXNxT1Ata0lXSU81TkFKRVItVmx1TUkxTkZsaHozTU1ndw&q=https%3A%2F%2Fkoros-closet.creator-spring.com%2Flisting%2Feverything-fox%3Fcountry%3DFR%26currency%3DEUR%26product%3D823%26tsmac%3Dgoogle%26tsmic%3Dyoutube%26variation%3D103575%26view_as%3DEUR%26utm_term%3DUCnBDyZSm1S2UFwgzCyIbCQg%26utm_medium%3Dproduct_shelf%26utm_source%3Dyoutube%26utm_content%3DYT-ACRcEUqPZ_1z0-b14MDFgz9Oxm1BIwdJkxE-y9N9OXONrndb_MG5NgJ6RqWVFrXof-GXmpiZMrex9PhkOzlSr66gT80amZu3FG7IPcWJmxSn5ISqATsTnkz3QFOBfqOa7jKtJEUMMZkwLEfpo4wsTPi4JUXINw6U9E8HGUOrpbaieRuTL-eCcPmSCGfgXZ-v8QeiKcjjBA8L5Xhfa4xRjONClke6j8P7EU-b4Tty6v6_zy6dPKHU1nLv&v=yylQn_QVQg4",
                  webPageType: "WEB_PAGE_TYPE_UNKNOWN",
                  rootVe: 83769,
                },
              },
              urlEndpoint: {
                url: "https://www.youtube.com/redirect?event=product_shelf&redir_token=QUFFLUhqbms2QnZNUGRuVWh4VmxJdWpOcUJiNGoteXg4UXxBQ3Jtc0tuczBkVjdxaVVSN1ZBTG5wc2x3dkZiOS1kVjRqRjQwdlRvVm9wWEdHT2JzY1BxT0k2cU9vSG1xMFRlQUE2SVE4ZmlwamxmS0hkLWJIR0tWTXNxT1Ata0lXSU81TkFKRVItVmx1TUkxTkZsaHozTU1ndw&q=https%3A%2F%2Fkoros-closet.creator-spring.com%2Flisting%2Feverything-fox%3Fcountry%3DFR%26currency%3DEUR%26product%3D823%26tsmac%3Dgoogle%26tsmic%3Dyoutube%26variation%3D103575%26view_as%3DEUR%26utm_term%3DUCnBDyZSm1S2UFwgzCyIbCQg%26utm_medium%3Dproduct_shelf%26utm_source%3Dyoutube%26utm_content%3DYT-ACRcEUqPZ_1z0-b14MDFgz9Oxm1BIwdJkxE-y9N9OXONrndb_MG5NgJ6RqWVFrXof-GXmpiZMrex9PhkOzlSr66gT80amZu3FG7IPcWJmxSn5ISqATsTnkz3QFOBfqOa7jKtJEUMMZkwLEfpo4wsTPi4JUXINw6U9E8HGUOrpbaieRuTL-eCcPmSCGfgXZ-v8QeiKcjjBA8L5Xhfa4xRjONClke6j8P7EU-b4Tty6v6_zy6dPKHU1nLv&v=yylQn_QVQg4",
                target: "TARGET_NEW_WINDOW",
                nofollow: true,
              },
            },
            trackingParams: "CBAQ-fgEGAAiEwi859rhz8L4AhX78UwCHcdfD8A=",
            creatorMessage: "is showcasing their merchandise",
            creatorName: "Koro",
            authorPhoto: {
              thumbnails: [
                {
                  url: "https://yt4.ggpht.com/DRbvplNyyRFYEdXBK2dnYJlVxzdMbi2sb3fkCEgO1KBNgNncJ6L4My7u_9c6fBhAH-Eg5t8QfQ=s32-c-k-c0x00ffffff-no-rj",
                  width: 32,
                  height: 32,
                },
                {
                  url: "https://yt4.ggpht.com/DRbvplNyyRFYEdXBK2dnYJlVxzdMbi2sb3fkCEgO1KBNgNncJ6L4My7u_9c6fBhAH-Eg5t8QfQ=s64-c-k-c0x00ffffff-no-rj",
                  width: 64,
                  height: 64,
                },
              ],
            },
            informationDialog: {
              liveChatDialogRenderer: {
                trackingParams: "CBEQzS8iEwi859rhz8L4AhX78UwCHcdfD8A=",
                dialogMessages: [
                  {
                    simpleText:
                      "The channel and YouTube may receive compensation from purchases in the links below.\n\nLinks and information below are from merchandise sellers and may change. Sellers may charge additional fees, such as shipping and handling fees, which may vary.Visit each seller's site(s) for more information, including pricing, and to buy merchandise. For merchandise that does not show the price, you may get charged in a foreign currency and the amount you pay may vary based on foreign currency exchange rates and bank fees.\n\nYouTube is not responsible for the links below, or for the merchandise information or sale of merchandise in the links. YouTube is also not responsible for your activities and purchases made through the links. Your activities and purchases made on the sellers' sites (including through the links below) are governed by the sellers' terms and conditions (including their privacy policies).",
                  },
                ],
                confirmButton: {
                  buttonRenderer: {
                    style: "STYLE_BLUE_TEXT",
                    text: { simpleText: "OK" },
                    accessibility: { label: "OK" },
                    // trackingParams: "CBIQ8FsiEwi859rhz8L4AhX78UwCHcdfD8A=",
                  },
                },
              },
            },
            isVerified: true,
          },
        },
        actionId: "ChwKGkNMM014Y1Nud3ZnQ0ZjTVZmUW9kMUg4SnVR",
        viewerIsCreator: false,
        targetId: "live-chat-banner",
        isStackable: false,
        backgroundType: "LIVE_CHAT_BANNER_BACKGROUND_TYPE_STATIC",
      },
    },
  };
  const result = parseAddBannerToLiveChatCommand(payload);
  // console.log(result);
  assert(result?.type === "addProductBannerAction");
});
