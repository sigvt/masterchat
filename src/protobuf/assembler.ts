import { b64d, b64e, B64Type } from "./b64";
import { bitob, cc } from "./util";

export type VCPair = {
  videoId: string;
  channelId: string;
};

export function hd(tgt: VCPair): string {
  return cc([
    ld(1, ld(5, [ld(1, tgt.channelId), ld(2, tgt.videoId)])),
    ld(3, ld(48687757, ld(1, tgt.videoId))),
    vt(4, 1),
  ]).toString("base64");
}

export function rlc(
  origin: VCPair,
  { top = false }: { top?: boolean } = {}
): string {
  const chatType = top ? 4 : 1;
  const meta = hd(origin);

  return b64e(
    ld(119693434, [ld(3, meta), vt(6, 1), ld(16, vt(1, chatType))]),
    B64Type.B1
  );
}

export function tmc(
  origin: VCPair,
  {
    top = false,
    since = new Date(),
  }: { top?: boolean; isOwner?: boolean; since?: Date } = {}
): string {
  const chatType = top ? 4 : 1;
  const meta = hd(origin);
  const t1 = Date.now() * 1000;
  const t2 = since.getTime() * 1000;

  return b64e(
    ld(119693434, [
      ld(3, meta),
      vt(5, t2),
      vt(6, 0),
      vt(8, 1),
      ld(9, [vt(1, 1), vt(3, 0), vt(4, 0), vt(10, t1), vt(11, 3), vt(15, 0)]),
      vt(10, t1),
      vt(11, t1),
      ld(16, vt(1, chatType)),
      vt(17, 0),
      vt(20, t1),
    ]),
    B64Type.B1
  );
}

export function cmp(
  chatId: string,
  authorChannelId: string,
  origin: VCPair
): string {
  const cid = b64d(chatId, B64Type.B1);

  return b64e(
    cc([
      ld(1, cid),
      ld(3, ld(5, [ld(1, origin.channelId), ld(2, origin.videoId)])),
      vt(4, 2),
      vt(5, 4),
      ld(6, ld(1, authorChannelId)),
    ]),
    B64Type.B2
  );
}

export function hdp(
  channelId: string,
  origin: VCPair,
  undo: boolean = false
): string {
  const op = undo ? 4 : 5;

  return b64e(
    cc([
      ld(1, ld(5, [ld(1, origin.channelId), ld(2, origin.videoId)])),
      ld(op, ld(1, channelId.replace(/^UC/, ""))),
      vt(10, 2),
      vt(11, 1),
    ]),
    B64Type.B2
  );
}

export function smp(to: VCPair, mn1: number = 1, mn2: number = 4): string {
  return b64e(
    cc([
      ld(1, ld(5, [ld(1, to.channelId), ld(2, to.videoId)])),
      vt(2, mn1),
      vt(3, mn2),
    ]),
    B64Type.B2
  );
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
  return cc([bitob(pbh(fid, 2)), bitob(encv(BigInt(bLen))), b]);
}

function vt(fid: bigint | number, payload: bigint | number): Buffer {
  return cc([bitob(pbh(fid, 0)), bitob(payload)]);
}

function pbh(fid: bigint | number, type: number): bigint {
  return encv((BigInt(fid) << 3n) | BigInt(type));
}

function encv(n: bigint): bigint {
  let s = 0n;
  while (n >> 7n) {
    s = (s << 8n) | 0x80n | (n & 0x7fn);
    n >>= 7n;
  }
  s = (s << 8n) | n;
  return s;
}
