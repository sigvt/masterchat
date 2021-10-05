import { YTThumbnailList } from "../interfaces/yt/chat";
import { Color } from "../interfaces/misc";

export function pickThumbUrl(thumbList: YTThumbnailList): string {
  return thumbList.thumbnails[thumbList.thumbnails.length - 1].url;
}

export function parseColorCode(code: number): Color {
  if (code > 4294967295) {
    throw new Error(`Invalid color code: ${code}`);
  }

  const b = code & 0xff;
  const g = (code >>> 8) & 0xff;
  const r = (code >>> 16) & 0xff;
  const opacity = code >>> 24;

  return { r, g, b, opacity };
}
