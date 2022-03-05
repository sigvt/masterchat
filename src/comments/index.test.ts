import assert from "assert";
import { getComment, getComments } from ".";
import { YTCommentThreadRenderer } from "..";
import { stringify } from "../utils";

it("can fetch comments", async () => {
  const videoId = "q5ctC_sWU4g";

  const res = await getComments(videoId, { top: true });
  const first = res.comments[0];
  prettyPrint(first);
});

it("can fetch comment by id", async () => {
  const videoId = "q5ctC_sWU4g";
  const commentId = "UgzNuL5flAW9vygeE9V4AaABAg";

  const comment = await getComment(videoId, commentId);
  assert(comment);

  prettyPrint(comment);
  const fetchedId = comment.comment.commentRenderer.commentId;

  expect(fetchedId).toEqual(commentId);
});

it("return undefined if wrong id specified", async () => {
  const videoId = "q5ctC_sWU4g";
  const commentId = "UgzNuL5flAW9vygeE9V4AaABAgwrong";

  const comment = await getComment(videoId, commentId);
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
