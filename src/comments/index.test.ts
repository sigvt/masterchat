import { getComments } from ".";
import { csc } from "../protobuf/assembler";
import { stringify } from "../utils";

it("can fetch comments", async () => {
  const videoId = "q5ctC_sWU4g";
  const commentId = "UgzNuL5flAW9vygeE9V4AaABAg";

  const res = await getComments(videoId, {
    highlightedCommentId: commentId,
  });
  const first = res.comments[0];
  const membership =
    first.comment.commentRenderer.sponsorCommentBadge
      ?.sponsorCommentBadgeRenderer.tooltip;
  const authorName = first.comment.commentRenderer.authorText.simpleText;
  console.log("Membership status for comment id:", commentId, "is", membership);
});
