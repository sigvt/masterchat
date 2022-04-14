import { YTRun } from "./yt";

export interface TranscriptSegment {
  startMs: number;
  endMs: number;
  snippet: YTRun[];
  startTimeText: string;
}
