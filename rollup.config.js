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
        sourcemap: true,
        format: "cjs",
      },
      {
        file: "./lib/masterchat.mjs",
        sourcemap: true,
        format: "es",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.build.json",
      }),
      isProd && terser(),
    ],
    external: ["crypto", "cross-fetch", "debug", "events"],
  },
  {
    input: "./lib/index.d.ts",
    output: {
      file: "./lib/masterchat.d.ts",
      format: "es",
    },
    plugins: [dts()],
    external: ["events"],
  },
];
