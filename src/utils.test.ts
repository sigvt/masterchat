import { textRunToPlainText, toVideoId } from "./utils";

it("toVideoId", () => {
  expect(
    toVideoId(
      "https://www.youtube.com/watch?list=PLziarN-vZTxELklDgc_y0q-ynm3DHylaS&v=nya_a4ysYso"
    )
  ).toBe("nya_a4ysYso");
});

describe("textRunToPlainText", () => {
  it("normal chat", () => {
    expect(
      textRunToPlainText({
        text: "yoooooo",
      })
    ).toBe("yoooooo");
  });

  it("youtube watch page", () => {
    expect(
      textRunToPlainText({
        text: "https://www.youtube.com/watch?v=1KMSC...",
        navigationEndpoint: {
          watchEndpoint: { videoId: "1KMSCvc7fVY", nofollow: true },
          commandMetadata: {
            webCommandMetadata: {
              rootVe: 3832,
              url: "/watch?v=1KMSCvc7fVY",
              webPageType: "WEB_PAGE_TYPE_WATCH",
            },
          },
        },
      })
    ).toBe("https://www.youtube.com/watch?v=1KMSCvc7fVY");
  });

  it("youtube watch page but shortened", () => {
    expect(
      textRunToPlainText({
        text: "https://youtu.be/iWIADZKU9dw",
        navigationEndpoint: {
          watchEndpoint: { nofollow: true, videoId: "iWIADZKU9dw" },
          commandMetadata: {
            webCommandMetadata: {
              rootVe: 3832,
              webPageType: "WEB_PAGE_TYPE_WATCH",
              url: "/watch?v=iWIADZKU9dw",
            },
          },
        },
      })
    ).toBe("https://www.youtube.com/watch?v=iWIADZKU9dw");
  });

  it("youtube watch page but hyper link", () => {
    expect(
      textRunToPlainText({
        text: "1 day ago",
        navigationEndpoint: {
          clickTrackingParams: "CAQQtnUYAiITCMnF0c_Zju8CFQ55jwodWdMK8w==",
          commandMetadata: {
            webCommandMetadata: {
              url: "/watch?v=yJ5agkia4o8\u0026lc=UgwxLeoyuMjwpVQZjP14AaABAg.9KBiYFA7H5w9KGoxAGz1EC",
              webPageType: "WEB_PAGE_TYPE_WATCH",
              rootVe: 3832,
            },
          },
          watchEndpoint: {
            videoId: "yJ5agkia4o8",
            params:
              "ejFVZ3d4TGVveXVNandwVlFaalAxNEFhQUJBZy45S0JpWUZBN0g1dzlLR294QUd6MUVDogIDwAEA",
          },
        },
      })
    ).toBe("1 day ago");
  });

  it("normal urls", () => {
    expect(
      textRunToPlainText({
        text: "https://vivalakiara.com/",
        navigationEndpoint: {
          urlEndpoint: {
            target: "TARGET_NEW_WINDOW",
            url: "https://www.youtube.com/redirect?event=live_chat&redir_token=QUFFLUhqbkM1aWg4bEJodllRc3NNUy1ObmpGc1cxSmtyd3xBQ3Jtc0tsSTU1TzUtdzlMbFMzTmNiaUhTdGVlOEtTbm95ZkZ5WWFVTDJQR2NiWXpiOHJzeVBCbmdGZ0oycW04M2Y4SC02eUlsSUNLV1FFdlVvYWw3al9sNjEwUlFxaXZIYjVKVE9PMFBwVDBWNm9ZU2doSlFPNA&q=https%3A%2F%2Fvivalakiara.com%2F",
            nofollow: true,
          },
          commandMetadata: {
            webCommandMetadata: {
              webPageType: "WEB_PAGE_TYPE_UNKNOWN",
              rootVe: 83769,
              url: "https://www.youtube.com/redirect?event=live_chat&redir_token=QUFFLUhqbkM1aWg4bEJodllRc3NNUy1ObmpGc1cxSmtyd3xBQ3Jtc0tsSTU1TzUtdzlMbFMzTmNiaUhTdGVlOEtTbm95ZkZ5WWFVTDJQR2NiWXpiOHJzeVBCbmdGZ0oycW04M2Y4SC02eUlsSUNLV1FFdlVvYWw3al9sNjEwUlFxaXZIYjVKVE9PMFBwVDBWNm9ZU2doSlFPNA&q=https%3A%2F%2Fvivalakiara.com%2F",
            },
          },
        },
      })
    ).toBe("https://vivalakiara.com/");

    expect(
      textRunToPlainText({
        text: "https://twitter.com/natsuiro...",
        navigationEndpoint: {
          commandMetadata: {
            webCommandMetadata: {
              url: "https://www.youtube.com/redirect?event=live_chat&redir_token=QUFFLUhqbm0yRDczR2FzQ2VrdFBLdUt5T2FobXI2QW9XZ3xBQ3Jtc0ttQkl3Vy1FSkVvNDZLR0lhZThsVHlXcWNXRlM2VVRqMzZxNzdnQUo3Zm1ncEhUbFJlN2lVb0RGa25lNmZfSUZ1eTdHeFdocVRDSi1rYjE5SURSUURNZDFXR0lKRVZTeFVBZHRHTDRURVhWclRFYkNvTQ&q=https%3A%2F%2Ftwitter.com%2Fnatsuiromatsuri%2Fstatus%2F1439578118063157250",
              webPageType: "WEB_PAGE_TYPE_UNKNOWN",
              rootVe: 83769,
            },
          },
          urlEndpoint: {
            url: "https://www.youtube.com/redirect?event=live_chat&redir_token=QUFFLUhqbm0yRDczR2FzQ2VrdFBLdUt5T2FobXI2QW9XZ3xBQ3Jtc0ttQkl3Vy1FSkVvNDZLR0lhZThsVHlXcWNXRlM2VVRqMzZxNzdnQUo3Zm1ncEhUbFJlN2lVb0RGa25lNmZfSUZ1eTdHeFdocVRDSi1rYjE5SURSUURNZDFXR0lKRVZTeFVBZHRHTDRURVhWclRFYkNvTQ&q=https%3A%2F%2Ftwitter.com%2Fnatsuiromatsuri%2Fstatus%2F1439578118063157250",
            target: "TARGET_NEW_WINDOW",
            nofollow: true,
          },
        },
      })
    ).toBe("https://twitter.com/natsuiromatsuri/status/1439578118063157250");
  });
});
