import { PBToken, PBType, PBValue } from "./token";

function mapType(type: PBType) {
  switch (type) {
    case PBType.LD:
      return "ld";
    case PBType.F32:
      return "f32";
    case PBType.F64:
      return "f64";
    case PBType.V:
      return "v";
  }
}

export function pprintPbValue(value: PBValue, depth = 0) {
  const pad = "".padEnd(depth * 4, " ");
  if (Array.isArray(value)) {
    for (const token of value) {
      if (token.type === PBType.LD) {
        console.log(pad + `[${token.fid} (${mapType(token.type)})] ->`);
        pprintPbValue(token.v, depth + 1);
      } else {
        console.log(
          pad + `[${token.fid} (${mapType(token.type)})] -> ${token.v}`
        );
      }
    }
  } else {
    console.log(pad + value);
  }
}

export function printBuf(buf: Uint8Array) {
  for (const el of buf) {
    console.log(
      el.toString(16).padStart(2, "0"),
      el.toString(2).padStart(8, "0"),
      el.toString()
    );
  }
}

export function toJSON(tokens: PBToken[]): string {
  return JSON.stringify(
    tokens,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
}

export function bitou8(n: bigint | number): Uint8Array {
  let hv = n.toString(16);
  hv = "".padStart(hv.length % 2, "0") + hv;
  return hextou8(hv);
}

export function u8tobi(buf: Uint8Array): bigint {
  return BigInt(`0x${u8tohex(buf)}`);
}

export function concatu8(args: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (let i = 0; i < args.length; ++i) {
    totalLength += args[i].length;
  }
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (let i = 0; i < args.length; ++i) {
    out.set(args[i], offset);
    offset += args[i].length;
  }
  return out;
}

export function hextou8(data: string): Uint8Array {
  data =
    data.startsWith("0x") || data.startsWith("0X") ? data.substring(2) : data;
  const out = new Uint8Array(data.length / 2);
  for (let i = 0; i < out.length; ++i) {
    out[i] = parseInt(data.substr(i * 2, 2), 16);
  }
  return out;
}

export function u8tohex(data: Uint8Array): string {
  let out = "";
  for (let i = 0; i < data.length; ++i) {
    out += data[i].toString(16).padStart(2, "0");
  }
  return out;
}

const _atob = globalThis.atob as ((data: string) => string) | undefined;
const _btoa = globalThis.btoa as ((data: string) => string) | undefined;

export const b64tou8 = _atob
  ? (data: string) => Uint8Array.from(_atob(data), (c) => c.charCodeAt(0))
  : (data: string) => {
      const buf = Buffer.from(data, "base64");
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    };

export const u8tob64 = _btoa
  ? (data: Uint8Array) => _btoa(String.fromCharCode.apply(null, data as any))
  : (data: Uint8Array) => Buffer.from(data).toString("base64");
