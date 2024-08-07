import { defineConfig } from "vite";
import { resolve } from "path";
import compression from "vite-plugin-compression";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

const chunks: { deps: string[]; name: string }[] = [];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      verbose: true,
    }),
    svgr({
      include: ["**/*.svg?react", "**/*.svg?r"],
      svgrOptions: {
        icon: true,
        replaceAttrValues: {
          fill: "currentColor",
        },
        svgo: true,
        svgProps: {
          clipRule: "evenodd",
          fill: "currentColor",
          fillRule: "evenodd",
          height: "1em",
          preserveAspectRatio: "xMidYMid meet",
          role: "img",
          width: "1em",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@assets": resolve(__dirname, "./src/assets"),
    },
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          for (const chunk of chunks) {
            if (chunk.deps.some((dep) => id.includes(dep))) {
              return chunk.name;
            }
          }
          return null;
        },
      },
    },
    chunkSizeWarningLimit: 2000,
    sourcemap: true,
  },
});
