import assert from "assert";
import { setupRecorder } from "nock-record";
import { Masterchat, YTCommentThreadRenderer } from "../../src";
import { stringify } from "../../src/utils";

const mode = (process.env.NOCK_BACK_MODE as any) || "lockdown";
const record = setupRecorder({ mode });

it("can fetch comments", async () => {
  const { completeRecording } = await record("fetch_comment");

  const videoId = "q5ctC_sWU4g";

  const mc = new Masterchat(videoId, "");
  const res = await mc.getComments({ top: true });
  const first = res.comments[0];
  prettyPrint(first);
  completeRecording();
});

it("can fetch comment by id", async () => {
  const { completeRecording } = await record("fetch_comment_by_id");

  const videoId = "q5ctC_sWU4g";
  const commentId = "UgzNuL5flAW9vygeE9V4AaABAg";

  const mc = new Masterchat(videoId, "");
  const comment = await mc.getComment(commentId);
  assert(comment);

  prettyPrint(comment);
  const fetchedId = comment.comment.commentRenderer.commentId;

  expect(fetchedId).toEqual(commentId);
  completeRecording();
});

it("return undefined if wrong id specified", async () => {
  const { completeRecording } = await record("wrong_id");
  const videoId = "q5ctC_sWU4g";
  const commentId = "UgzNuL5flAW9vygeE9V4AaABAgwrong";

  const mc = new Masterchat(videoId, "");
  await expect(mc.getComment(commentId)).resolves.toBeUndefined();
  completeRecording();
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
