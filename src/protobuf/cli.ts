import { B64Type, db64 } from "./container";
import { parse } from "./parser";
import { pprintPbValue } from "./util";

function main(input: string, type: string = B64Type.BUB) {
  const buf = db64(input, type as B64Type);
  pprintPbValue(parse(buf));
}

main(process.argv[2], process.argv[3]);
