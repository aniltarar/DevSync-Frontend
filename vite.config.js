import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import VueDevTool from "vite-plugin-vue-devtools";



export default defineConfig({
  plugins: [vue(), VueDevTool()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});