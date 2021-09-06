import { B64Type, eb64 } from "./container";
import { bitob, cc } from "./util";

export type CVPair = {
  videoId: string;
  channelId: string;
};

export function rcnt(
  target: CVPair,
  { top = false }: { top?: boolean } = {}
): string {
  const chatType = top ? 4 : 1;

  const meta = hd(target);

  const payload = ld(119693434, [
    ld(3, meta),
    vt(6, 1),
    ld(16, vt(1, chatType)),
  ]);

  return eb64(payload, B64Type.BUB);
}

export function tcnt(
  target: CVPair,
  {
    top = false,
    isOwner = false,
    since = new Date(),
  }: { top?: boolean; isOwner?: boolean; since?: Date } = {}
): string {
  const chatType = top ? 4 : 1;

  const t1 = Date.now() * 1000;
  const t2 = since.getTime() * 1000;

  const meta = hd(target);

  const payload = ld(119693434, [
    ld(3, meta),
    vt(5, t1),
    vt(6, 0),
    vt(8, 1),
    ld(9, [vt(1, 1), vt(3, 0), vt(4, 0), vt(10, t1), vt(11, 3), vt(15, 0)]),
    vt(10, t1),
    vt(11, t2),
    ld(16, vt(1, chatType)),
    vt(17, 0),
    vt(20, t1),
  ]);

  return eb64(payload, B64Type.BUB);
}

export function hd(tgt: CVPair): string {
  return cc([
    ld(1, ld(5, [ld(1, tgt.channelId), ld(2, tgt.videoId)])),
    ld(3, ld(48687757, ld(1, tgt.videoId))),
    vt(4, 1),
  ]).toString("base64");
}

export function hp(
  targetChannelId: string,
  from: CVPair,
  undo: boolean = false
): string {
  const op = undo ? 4 : 5;

  const payload = cc([
    ld(1, ld(5, [ld(1, from.channelId), ld(2, from.videoId)])),
    ld(op, ld(1, targetChannelId.replace(/^UC/, ""))),
    vt(10, 2),
    vt(11, 1),
  ]);

  return eb64(payload, B64Type.BUB);
}

export function smp(to: CVPair, mn1: number = 1, mn2: number = 4): string {
  const payload = cc([
    ld(1, ld(5, [ld(1, to.channelId), ld(2, to.videoId)])),
    vt(2, mn1),
    vt(3, mn2),
  ]);

  return eb64(payload, B64Type.BUB);
}

/**
 * Builder
 */

function ld(fid: bigint | number, payload: Buffer[] | Buffer | string): Buffer {
  const b =
    typeof payload === "string"
      ? Buffer.from(payload)
      : Array.isArray(payload)
      ? Buffer.concat(payload)
      : payload;
  const bLen = b.byteLength;
  return cc([bitob(pbHeader(fid, 2)), bitob(encodeVariant(BigInt(bLen))), b]);
}

function vt(fid: bigint | number, payload: bigint | number): Buffer {
  return cc([bitob(pbHeader(fid, 0)), bitob(payload)]);
}

function pbHeader(fid: bigint | number, type: number): bigint {
  if (type & 0x8) throw new Error("Invalid type");
  return encodeVariant((BigInt(fid) << 3n) | BigInt(type));
}

function encodeVariant(n: bigint): bigint {
  let s = 0n;
  while (n >> 7n) {
    s = (s << 8n) | 0x80n | (n & 0x7fn);
    n >>= 7n;
  }
  s = (s << 8n) | n;
  return s;
}
