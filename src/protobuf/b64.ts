import { b64tou8, u8tob64 } from "./util";

export enum B64Type {
  B1 = "b1",
  B2 = "b2",
}

function urlsafeB64e(payload: Uint8Array): string {
  return encodeURIComponent(u8tob64(payload));
}

function urlsafeB64d(payload: string): Uint8Array {
  return b64tou8(decodeURIComponent(payload));
}

export function b64e(payload: Uint8Array, type: B64Type): string {
  switch (type) {
    case B64Type.B1:
      return urlsafeB64e(payload);
    case B64Type.B2:
      const urlsafe = urlsafeB64e(payload);
      const encoded = new TextEncoder().encode(urlsafe);
      return u8tob64(encoded);
    // return u8tob64(new TextEncoder().encode(urlsafeB64e(payload)));
    default:
      throw new Error("Invalid b64type: " + type);
  }
}

export function b64d(payload: string, type: B64Type): Uint8Array {
  switch (type) {
    case B64Type.B1:
      return urlsafeB64d(payload);
    case B64Type.B2:
      const b64 = b64tou8(payload);
      const decoded = new TextDecoder().decode(b64);
      return urlsafeB64d(decoded);
    // return urlsafeB64d(new TextDecoder().decode(b64tou8(payload)));
    default:
      throw new Error("Invalid b64type: " + type);
  }
}
