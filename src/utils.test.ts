import { textRunToPlainText, toVideoId } from "./utils";

it("toVideoId", () => {
  expect(
    toVideoId(
      "https://www.youtube.com/watch?list=PLziarN-vZTxELklDgc_y0q-ynm3DHylaS&v=nya_a4ysYso"
    )
  ).toBe("nya_a4ysYso");
});

it("textRunToPlainText", () => {
  expect(
    textRunToPlainText({
      text: "uyk91P1vWWA",
      navigationEndpoint: {
        commandMetadata: {
          webCommandMetadata: {
            url: "/watch?v=uyk91P1vWWA",
            webPageType: "WEB_PAGE_TYPE_WATCH",
            rootVe: 3832,
          },
        },
        watchEndpoint: {
          videoId: "uyk91P1vWWA",
          nofollow: true,
        },
      },
    })
  ).toBe("https://www.youtube.com/watch?v=uyk91P1vWWA");

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
