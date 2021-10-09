import debug from "debug";
import { ProtoBufReader } from "./reader";
import { PBToken, PBType, PBValue } from "./token";

const debugLog = debug("masterchat:pb");

export function parsePb(input: Uint8Array, depth: number = 0): PBValue {
  function logger(...obj: any) {
    debugLog(depth + "".padEnd(depth * 2, " "), obj.join(" "));
  }

  const pbr = new ProtoBufReader(input);

  const tokens: PBToken[] = [];
  let nextHeader;

  while ((nextHeader = pbr.eatVariant())) {
    logger(" rawHeader=", nextHeader.toString(2));
    const [fid, type] = ProtoBufReader.splitHeader(nextHeader);
    logger(`┌(${fid}: ${type})`);
    switch (type) {
      case 0: {
        const v = pbr.eatVariant();
        logger("└(var)", v);
        if (v == null) throw new Error("Invalid sequence (v)");
        tokens.push({ fid, type: PBType.V, v });
        break;
      }
      case 2: {
        pbr.save();
        const len = pbr.eatVariant();
        logger(`└struct [length=${len}]>`);
        if (len == null) throw new Error("Invalid sequence (ld)");
        if (len > pbr.remainingBytes()) {
          logger("!overSized");
          pbr.rewind();
        } else {
          const inner = pbr.eat(Number(len));
          if (inner == null) {
            logger("!empty");
            pbr.rewind();
          } else {
            const v = parsePb(inner, depth + 1);
            tokens.push({ fid, type: PBType.LD, v });
            break;
          }
        }
      }
      case 1: {
        pbr.save();
        const v = pbr.eatUInt64();
        logger("└f64>", v);
        if (v !== null) {
          tokens.push({ fid, type: PBType.F64, v });
          break;
        }
        // throw new Error("Invalid sequence (f64)");
        pbr.rewind();
      }
      case 5: {
        pbr.save();
        const v = pbr.eatUInt32();
        logger("└f32>", v);

        if (v !== null) {
          tokens.push({ fid, type: PBType.F32, v });
          break;
        }

        // throw new Error("Invalid sequence (f32)");
        pbr.rewind();
      }
      default: {
        // throw new Error("Unknown type: " + type);
        debugLog(input);
        const res = new TextDecoder().decode(input);
        logger("└str>", res);
        return res;
      }
    }
  }

  if (tokens.length === 0) {
    throw new Error("Empty sequence");
  }

  return tokens;
}
