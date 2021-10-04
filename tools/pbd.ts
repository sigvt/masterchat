#!/usr/bin/env/node
// pb decoder

import { b64d, B64Type, parsePb, pprintPbValue } from "masterchat";

function main(input: string, type: string = B64Type.B2) {
  const buf = b64d(input, type as B64Type);
  const pl = parsePb(buf);
  console.log(
    JSON.stringify(pl, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
  pprintPbValue(pl);
}

if (process.argv.length < 3) {
  console.log("pbd <token> [<type>]");
  process.exit(1);
}

main(process.argv[2], process.argv[3]);
