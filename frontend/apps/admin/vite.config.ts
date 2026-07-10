import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const packages = path.resolve(__dirname, "../../packages");

export default defineConfig({
  envDir: path.resolve(__dirname, "../.."),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@itp/ui": path.join(packages, "ui/src"),
      "@itp/hooks": path.join(packages, "hooks/src"),
      "@itp/utils": path.join(packages, "utils/src"),
    },
  },
  server: { port: 3001 },
});
