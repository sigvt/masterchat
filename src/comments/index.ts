import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { DH, DO, EP_NXT } from "../constants";
import {
  RenderingPriority,
  YTCommentThreadRenderer,
  YTContinuationItem,
} from "../interfaces/yt/comments";
import { csc, CscOptions } from "../protobuf/assembler";
import { withContext } from "../utils";

async function ytPost(
  input: string,
  body: any,
  config: AxiosRequestConfig = {}
) {
  if (!input.startsWith("http")) {
    input = DO + input;
  }

  return axios.request({
    ...config,
    url: input,
    method: "POST",
    headers: {
      ...config.headers,
      "Content-Type": "application/json",
      ...DH,
    },
    data: body,
  });
}

// Comment

export async function getComment(videoId: string, commentId: string) {
  const comments = await getComments(videoId, {
    highlightedCommentId: commentId,
  });
  if (comments.error) {
    throw comments.error;
  }
  const first = comments.comments?.[0];
  if (first.renderingPriority !== RenderingPriority.LinkedComment)
    return undefined;

  return first;
}

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

  try {
    const res = await ytPost(EP_NXT, body);

    const payload = res.data;

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
  } catch (err) {
    const data = (err as AxiosError)?.response?.data;
    if (data) {
      return data;
    }
    throw err;
  }
}
