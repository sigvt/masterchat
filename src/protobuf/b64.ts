export enum B64Type {
  B1 = "b1",
  B2 = "b2",
}

function urlsafeB64e(payload: Buffer): string {
  return encodeURIComponent(payload.toString("base64"));
}

function urlsafeB64d(payload: string): Buffer {
  return Buffer.from(decodeURIComponent(payload), "base64");
}

export function b64e(payload: Buffer, type: B64Type): string {
  switch (type) {
    case B64Type.B1:
      return urlsafeB64e(payload);
    case B64Type.B2:
      return Buffer.from(urlsafeB64e(payload)).toString("base64");
    default:
      throw new Error("Invalid b64type: " + type);
  }
}

export function b64d(payload: string, type: B64Type): Buffer {
  switch (type) {
    case B64Type.B1:
      return urlsafeB64d(payload);
    case B64Type.B2:
      return urlsafeB64d(Buffer.from(payload, "base64").toString());
    default:
      throw new Error("Invalid b64type: " + type);
  }
}
