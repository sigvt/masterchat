import { EP_NXT } from "../constants";
import {
  YTCommentThreadRenderer,
  YTContinuationItem,
} from "../interfaces/yt/comments";
import { csc, CscOptions } from "../protobuf/assembler";
import { withContext, ytFetch } from "../utils";

export async function getComments(
  videoId: string,
  continuation: string | CscOptions = {}
) {
  if (typeof continuation !== "string") {
    continuation = csc(videoId, continuation);
  }

  const body = withContext({
    continuation,
  });

  const res = await ytFetch(EP_NXT, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const payload = await res.json();

  const endpoints = payload.onResponseReceivedEndpoints;
  const isAppend = endpoints.length === 1;

  const items: YTContinuationItem[] = isAppend
    ? endpoints[0].appendContinuationItemsAction.continuationItems
    : endpoints[1].reloadContinuationItemsCommand.continuationItems;

  const nextContinuation =
    items[items.length - 1].continuationItemRenderer?.continuationEndpoint
      .continuationCommand.token;

  const comments = items
    .map((item) => item.commentThreadRenderer)
    .filter((rdr): rdr is YTCommentThreadRenderer => rdr !== undefined);

  return {
    comments,
    continuation: nextContinuation,
    next: nextContinuation
      ? () => getComments(videoId, nextContinuation)
      : undefined,
  };
}
