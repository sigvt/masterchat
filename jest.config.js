module.exports = {
  preset: "ts-jest/presets/default-esm",
  globals: {
    "ts-jest": {
      tsconfig: "./tests/tsconfig.json",
      useESM: true,
    },
  },
};
