#!/usr/bin/env/node

import { b64d, B64Type } from "masterchat/lib/protobuf/b64";
import { parse } from "masterchat/lib/protobuf/parser";
import { pprintPbValue } from "masterchat/lib/protobuf/util";

function main(input: string, type: string = B64Type.B2) {
  const buf = b64d(input, type as B64Type);
  const pl = parse(buf);
  console.log(pl);
  pprintPbValue(pl);
}

if (process.argv.length < 3) {
  console.log("pbd <token> <type>");
  process.exit(1);
}

main(process.argv[2], process.argv[3]);
