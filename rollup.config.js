import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";

const isProd = process.env.NODE_ENV === "production";

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./lib/masterchat.js",
        sourcemap: false,
        format: "cjs",
      },
      {
        file: "./lib/masterchat.mjs",
        sourcemap: false,
        format: "es",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.build.json",
      }),
      isProd && terser({ keep_classnames: true }),
    ],
    external: ["crypto", "cross-fetch", "events", "util", "buffer", "debug"],
  },
  {
    input: "./lib/index.d.ts",
    output: {
      file: "./lib/masterchat.d.ts",
      format: "es",
    },
    plugins: [dts()],
    external: ["events", "util"],
  },
];
