import { hextou8, u8tohex, b64tou8, u8tob64, concatu8 } from "./util";

describe("protobuf util", () => {
  it.each([
    ["00FF00FF", [0, 255, 0, 255]],
    ["0x00FF00ff", [0, 255, 0, 255]],
    ["0X00ff00FF", [0, 255, 0, 255]],
  ])("can convert hex to u8 array", (hex, expected) => {
    expect(hextou8(hex)).toEqual(new Uint8Array(expected));
  });

  const u8 = new TextEncoder().encode("Hello, world!");
  const b64 = "SGVsbG8sIHdvcmxkIQ==";

  it("can convert u8 array to hex", () => {
    expect(u8tohex(new Uint8Array([0, 255, 0, 255]))).toEqual("00ff00ff");
  });

  it("can convert b64 to u8 array", () => {
    expect(b64tou8(b64)).toEqual(u8);
  });

  it("can convert u8 array to b64", () => {
    expect(u8tob64(u8)).toEqual(b64);
  });

  it("can concatenate u8 arrays", () => {
    expect(
      concatu8([
        new Uint8Array([0, 255]),
        new Uint8Array([0, 255]),
        new Uint8Array([3, 3]),
      ])
    ).toEqual(new Uint8Array([0, 255, 0, 255, 3, 3]));
  });
});
