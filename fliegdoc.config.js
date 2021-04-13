module.exports = {
  modules: [
    {
      package: "./packages/core/package.json",
      tsconfig: "./packages/core/tsconfig.json",
      mainFile: "index.ts",
    },
    {
      package: "./packages/cli/package.json",
      tsconfig: "./packages/cli/tsconfig.json",
      mainFile: "cli.ts",
    },
  ],
};
