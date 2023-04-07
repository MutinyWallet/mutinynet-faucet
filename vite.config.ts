import solid from "solid-start/vite";
import { defineConfig } from "vite";
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

export default defineConfig({
  // Need this to use bitcoin-core
  plugins: [solid(), viteCommonjs()],
});
