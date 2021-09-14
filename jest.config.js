module.exports = {
  preset: "ts-jest/presets/default-esm",
  testPathIgnorePatterns: ["lib"],
  globals: {
    "ts-jest": {
      tsconfig: "./src/tsconfig.esm.json",
      useESM: true,
    },
  },
};
