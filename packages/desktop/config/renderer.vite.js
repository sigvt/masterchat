const { join } = require("path");
import reactRefresh from "@vitejs/plugin-react-refresh";
const { chrome } = require("./electron-dep-versions");
/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
module.exports = {
  root: join(process.cwd(), "./src/renderer"),
  resolve: {
    alias: {
      "/@/": join(process.cwd(), "./src/renderer") + "/",
    },
  },
  plugins: [reactRefresh()],
  build: {
    target: `chrome${chrome}`,
    polyfillDynamicImport: false,
    base: "",
    outDir: join(process.cwd(), "dist/source/renderer"),
    assetsDir: ".",
    rollupOptions: {
      external: require("./external-packages").default,
    },
    emptyOutDir: true,
  },
};
