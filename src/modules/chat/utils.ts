import { YTAction, YTContinuationContents } from "../../yt/chat";
import { Color, OmitTrackingParams, TimedContinuation } from "./types";

export function unwrapReplayActions(rawActions: YTAction[]) {
  return rawActions.map(
    // TODO: verify that an action always holds a single item.
    (action): YTAction => {
      const replayAction = Object.values(omitTrackingParams(action))[0] as any;

      return replayAction.actions[0];
    }
  );
}

export function parseColorCode(code: number): Color | undefined {
  if (code > 4294967295) {
    return undefined;
  }

  const b = code & 0xff;
  const g = (code >>> 8) & 0xff;
  const r = (code >>> 16) & 0xff;
  const opacity = code >>> 24;

  return { r, g, b, opacity };
}

export function getTimedContinuation(
  continuationContents: YTContinuationContents
): TimedContinuation | undefined {
  /**
   * observed k: invalidationContinuationData | timedContinuationData | liveChatReplayContinuationData
   * continuations[1] would be playerSeekContinuationData
   */
  if (
    Object.keys(
      continuationContents.liveChatContinuation.continuations[0]
    )[0] === "playerSeekContinuationData"
  ) {
    // only playerSeekContinuationData
    return undefined;
  }

  const continuation = Object.values(
    continuationContents.liveChatContinuation.continuations[0]
  )[0];
  if (!continuation) {
    // no continuation
    return undefined;
  }
  return {
    token: continuation.continuation,
    timeoutMs: continuation.timeoutMs,
  };
}

/**
 * Remove `clickTrackingParams` and `trackingParams` from object
 */
export function omitTrackingParams<T>(obj: T): OmitTrackingParams<T> {
  return Object.entries(obj)
    .filter(([k]) => k !== "clickTrackingParams" && k !== "trackingParams")
    .reduce(
      (sum, [k, v]) => ((sum[k as keyof OmitTrackingParams<T>] = v), sum),
      {} as OmitTrackingParams<T>
    );
}
