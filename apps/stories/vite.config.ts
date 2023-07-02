import solid from "solid-start/vite";
import dotenv from "dotenv";
import { defineConfig } from "vite";
import prpc from "@prpc/vite";
import devtools from 'solid-devtools/vite'

export default defineConfig(() => {
  dotenv.config();
  //[ssr: process.env.NODE_ENV === "Development" ? false : true }
  return {
    plugins: [
      prpc(),
      devtools({
        /* features options - all disabled by default */
        autoname: true, // e.g. enable autoname
      }),
      solid({ ssr: true }),
    ],
    server: { host: true },
    /*  build: { target: "es2020" },
    optimizeDeps: { esbuildOptions: "es2020" }, */
  };
});
