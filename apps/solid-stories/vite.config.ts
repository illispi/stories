import solid from "solid-start/vite";
import dotenv from "dotenv";
import { defineConfig } from "vite";

export default defineConfig(() => {
  dotenv.config();
  //[ssr: process.env.NODE_ENV === "Development" ? false : true }
  return {
    plugins: [solid({ ssr: false })],
    server: { host: true },
    /*  build: { target: "es2020" },
    optimizeDeps: { esbuildOptions: "es2020" }, */
  };
});
