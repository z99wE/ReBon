import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

function manualChunks(id: string) {
  if (!id.includes("node_modules")) return undefined;

  if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
    return "react-vendor";
  }
  if (id.includes("@radix-ui")) return "radix";
  if (id.includes("@tanstack")) return "tanstack";
  if (id.includes("recharts")) return "charts";
  if (id.includes("mermaid")) return "mermaid";
  if (id.includes("streamdown") || id.includes("katex") || id.includes("remark") || id.includes("rehype")) return "markdown";
  if (id.includes("lucide-react")) return "icons";

  const match = id.split("node_modules/").pop();
  if (!match) return "vendor";
  const [scopeOrPackage, maybePackage] = match.split("/");
  const packageName = scopeOrPackage.startsWith("@") && maybePackage ? `${scopeOrPackage}-${maybePackage}` : scopeOrPackage;
  return packageName.replace(/[@/]/g, "-");
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 8000,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    host: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
