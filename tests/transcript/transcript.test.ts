import { Masterchat } from "../../src";

it("can fetch transcript", async () => {
  const videoId = "VFxHb8KY2LI";

  const mc = new Masterchat(videoId, "");

  const res = await mc.getTranscript("id");

  expect(res).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        startMs: expect.any(Number),
        endMs: expect.any(Number),
        snippet: expect.arrayContaining([
          expect.objectContaining({ text: expect.any(String) }),
        ]),
        startTimeText: expect.any(String),
      }),
    ])
  );
});
