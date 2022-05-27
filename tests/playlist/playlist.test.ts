import { Masterchat } from "../../src";

it("can fetch playlist", async () => {
  const mc = new Masterchat("", "UCyl1z3jo3XHR1riLFKG5UAg");
  const res = await mc.getPlaylist({ type: "membersOnly" });

  expect(res).toEqual(
    expect.objectContaining({
      title: expect.any(String),
      description: expect.any(String),
      videos: expect.arrayContaining([
        expect.objectContaining({
          videoId: expect.any(String),
          title: expect.arrayContaining([
            expect.objectContaining({ text: expect.any(String) }),
          ]),
          thumbnailUrl: expect.any(String),
          length: expect.any(Number),
          lengthText: expect.any(String),
        }),
      ]),
    })
  );
});
