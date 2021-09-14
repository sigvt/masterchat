import { normalizeVideoId } from "./utils";

it("normalizeVideoId", () => {
  expect(
    normalizeVideoId(
      "https://www.youtube.com/watch?list=PLziarN-vZTxELklDgc_y0q-ynm3DHylaS&v=nya_a4ysYso"
    )
  ).toBe("nya_a4ysYso");
});
