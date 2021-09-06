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

export function printBuf(buf: Buffer) {
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
    (k, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
}

export function bitob(n: bigint | number): Buffer {
  let hv = n.toString(16);
  hv = "".padStart(hv.length % 2, "0") + hv;
  return Buffer.from(hv, "hex");
}

export function btobi(buf: Buffer): bigint {
  return BigInt(`0x${buf.toString("hex")}`);
}

export function cc(args: Buffer[]) {
  return Buffer.concat(args);
}
