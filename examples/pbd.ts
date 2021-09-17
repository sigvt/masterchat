#!/usr/bin/env/node

import { protobuf } from "masterchat";
import { B64Type } from "masterchat/lib/protobuf";

function main(input: string, type: string = B64Type.B2) {
  const buf = protobuf.b64d(input, type as B64Type);
  const pl = protobuf.parse(buf);
  console.log(pl);
  protobuf.pprintPbValue(pl);
}

if (process.argv.length < 3) {
  console.log("pbd <token> <type>");
  process.exit(1);
}

main(process.argv[2], process.argv[3]);
