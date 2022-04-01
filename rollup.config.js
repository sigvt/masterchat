import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
// import { terser } from "rollup-plugin-terser";

const isProd = process.env.NODE_ENV === "production";

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: "./lib/masterchat.js",
        sourcemap: !isProd,
        format: "cjs",
      },
      {
        file: "./lib/masterchat.mjs",
        sourcemap: !isProd,
        format: "es",
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.build.json",
      }),
      nodeResolve({
        preferBuiltins: false, // required for `events` polyfill
      }),
      commonjs(),
      // isProd &&
      //   terser({
      //     keep_classnames: true, // avoid Error class mangling
      //   }),
    ],
    external: ["cross-fetch", "debug"],
  },
  {
    input: "./lib/lib/index.d.ts",
    output: {
      file: "./lib/masterchat.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
