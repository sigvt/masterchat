import commonjs from "@rollup/plugin-commonjs";
import nodePolyfills from "rollup-plugin-node-polyfills";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import externals from "rollup-plugin-node-externals";

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
      nodePolyfills(),
      externals({
        devDeps: false, // embed devDeps
        builtins: false, // for `events` polyfill,
        // builtinsPrefix: "add",
        // exclude: ["events"],
      }),
      nodeResolve({
        // preferBuiltins: false, // for `events` polyfill
      }),
      // json(),
      commonjs(),
    ],
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
