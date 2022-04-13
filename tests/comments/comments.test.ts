import assert from "assert";
import { Masterchat, YTCommentThreadRenderer } from "../../src";
import { stringify } from "../../src/utils";

it("can fetch comments", async () => {
  const videoId = "q5ctC_sWU4g";

  const mc = new Masterchat(videoId, "");
  const res = await mc.getComments({ top: true });
  const first = res.comments[0];
  prettyPrint(first);
});

it("can fetch comment by id", async () => {
  const videoId = "q5ctC_sWU4g";
  const commentId = "UgzNuL5flAW9vygeE9V4AaABAg";

  const mc = new Masterchat(videoId, "");
  const comment = await mc.getComment(commentId);
  assert(comment);

  prettyPrint(comment);
  const fetchedId = comment.comment.commentRenderer.commentId;

  expect(fetchedId).toEqual(commentId);
});

it("return undefined if wrong id specified", async () => {
  const videoId = "q5ctC_sWU4g";
  const commentId = "UgzNuL5flAW9vygeE9V4AaABAgwrong";

  const mc = new Masterchat(videoId, "");
  const comment = await mc.getComment(commentId);
  expect(comment).toBeUndefined();
});

function prettyPrint(comment: YTCommentThreadRenderer) {
  const id = comment.comment.commentRenderer.commentId;
  const membership =
    comment.comment.commentRenderer.sponsorCommentBadge
      ?.sponsorCommentBadgeRenderer.tooltip;
  const authorName = comment.comment.commentRenderer.authorText.simpleText;
  const message = stringify(comment.comment.commentRenderer.contentText);

  console.log(
    "id:",
    id,
    "membership:",
    membership,
    "author:",
    authorName,
    "message:",
    message
  );
}
