#!/usr/bin/env/node

import { b64d, B64Type, parsePb, pprintPbValue } from "masterchat";

function main(input: string, type: string = B64Type.B2) {
  const buf = b64d(input, type as B64Type);
  const pl = parsePb(buf);
  console.log(pl);
  pprintPbValue(pl);
}

if (process.argv.length < 3) {
  console.log("pbd <token> <type>");
  process.exit(1);
}

main(process.argv[2], process.argv[3]);
