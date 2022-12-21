import solid from "solid-start/vite";
import dotenv from "dotenv";
import { defineConfig } from "vite";

export default defineConfig(() => {
  dotenv.config();

  return {
    plugins: [
      solid({ ssr: process.env.NODE_ENV === "Development" ? false : true }),
    ],
    server: { host: true },
    /*  build: { target: "es2020" },
    optimizeDeps: { esbuildOptions: "es2020" }, */
  };
});
