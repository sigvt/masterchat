module.exports = {
  preset: "ts-jest/presets/default-esm",
  testPathIgnorePatterns: ["lib"],
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
      useESM: true,
    },
  },
};
