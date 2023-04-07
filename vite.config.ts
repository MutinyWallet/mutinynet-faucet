import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // Need this to use bitcoin-core
  plugins: [solid()],
});
