export enum B64Type {
  BUB = "bub",
  BU = "bu",
  B = "b",
}

export function eb64(payload: Buffer, type: B64Type): string {
  switch (type) {
    case B64Type.BUB:
      return Buffer.from(
        encodeURIComponent(payload.toString("base64"))
      ).toString("base64");
    case B64Type.BU:
      return encodeURIComponent(payload.toString("base64"));
    case B64Type.B:
      return payload.toString("base64");
    default:
      throw new Error("Invalid b64type: " + type);
  }
}

export function db64(payload: string, type: B64Type): Buffer {
  switch (type) {
    case B64Type.BUB:
      return Buffer.from(
        decodeURIComponent(Buffer.from(payload, "base64").toString()),
        "base64"
      );
    case B64Type.BU:
      return Buffer.from(decodeURIComponent(payload), "base64");
    case B64Type.B:
      return Buffer.from(payload, "base64");
    default:
      throw new Error("Invalid b64type: " + type);
  }
}
