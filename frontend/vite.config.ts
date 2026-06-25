import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración mínima de Vite + React.
// `global: globalThis` evita errores de algunas libs (como stellar-sdk) en el browser.
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
});
