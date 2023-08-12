import solid from "solid-start/vite";
import dotenv from "dotenv";
import { PluginOption, defineConfig } from "vite";
import prpc from "@prpc/vite";
import devtools from "solid-devtools/vite";
import { visualizer } from "rollup-plugin-visualizer";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig(() => {
  dotenv.config();
  //[ssr: process.env.NODE_ENV === "DEV" ? false : true }
  return {
    plugins: [
      // visualizer({
      //   template: "treemap", // or sunburst
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: "analyse.html", // will be saved in project's root
      // }) as PluginOption,
      prpc(),

      //TEST process.env.NODE_ENV === "development" ? [basicSsl()] : [],

      // devtools({
      //   /* features options - all disabled by default */
      //   autoname: true, // e.g. enable autoname
      // }),
      solid({ ssr: true }),
    ],
    server: { host: true },
    //TEST server: { host: true, https: true },
    /*  build: { target: "es2020" },
    optimizeDeps: { esbuildOptions: "es2020" }, */
  };
});

//NOTE solidjs dev tools uncomment import in entry-client.tsx aswell