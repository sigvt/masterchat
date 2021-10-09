export class ProtoBufReader {
  buf: Uint8Array;
  c: number;
  s: number = 0;

  static splitHeader(n: bigint): [bigint, number] {
    return [n >> 3n, Number(n & 0x7n)];
  }

  static parseVariant(buf: Uint8Array): bigint {
    return buf.reduce(
      (r, b, i) => r | ((BigInt(b) & 0x7fn) << (BigInt(i) * 7n)),
      0n
    );
  }

  constructor(buf: Uint8Array) {
    this.buf = buf;
    this.c = 0;
  }

  eat(bytes: number): Uint8Array | null {
    if (this.isEnded()) return null;
    return this.buf.slice(this.c, (this.c += bytes));
  }

  eatUInt32(): number | null {
    if (this.isEnded()) return null;
    try {
      const n = new DataView(this.buf.buffer).getUint32(this.c, true);
      // const n = this.buf.readUInt32LE(this.c);
      this.c += 4;
      return n;
    } catch (err) {
      return null;
    }
  }

  eatUInt64(): bigint | null {
    if (this.isEnded()) return null;
    try {
      const n = new DataView(this.buf.buffer).getBigUint64(this.c, true);
      // const n = this.buf.readBigUInt64LE(this.c);
      this.c += 8;
      return n;
    } catch (err) {
      return null;
    }
  }

  eatVariant(): bigint | null {
    if (this.isEnded()) return null;
    const start = this.c;
    while (this.buf[this.c] & 0x80) this.c += 1;
    const rawBuf = this.buf.slice(start, (this.c += 1));
    return ProtoBufReader.parseVariant(rawBuf);
  }

  save() {
    this.s = this.c;
  }

  rewind(b?: number) {
    if (b !== undefined) {
      this.c -= b;
    } else {
      this.c = this.s;
    }
  }

  remainingBytes() {
    return this.buf.length - this.c;
  }

  isEnded(): boolean {
    return this.c === this.buf.length;
  }
}
