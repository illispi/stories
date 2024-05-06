import { imagetools } from "vite-imagetools";
import { defineConfig } from "@solidjs/start/config";
import dotenv from "dotenv";
import devtools from "solid-devtools/vite";
import { visualizer } from "rollup-plugin-visualizer";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig( {
  //[ssr: process.env.NODE_ENV === "DEV" ? false : true }
  
    // plugins: [
      // visualizer({
      //   template: "treemap", // or sunburst
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: "analyse.html", // will be saved in project's root
      // }) as PluginOption,

      //TEST process.env.NODE_ENV === "development" ? [basicSsl()] : [],

      // devtools({
      //   /* features options - all disabled by default */
      //   autoname: true, // e.g. enable autoname
      // }),
    //   imagetools(),
    //   solid({ ssr: true }),
    // ],
    // server: {
    //   strictPort: true,
    //   port: 3000,
    //   host: true,
    //   https: process.env.NODE_ENV === "production" ? true : false,
    // },
    /*  build: { target: "es2020" },
    optimizeDeps: { esbuildOptions: "es2020" }, */
   

    

  
});

//NOTE solidjs dev tools uncomment import in entry-client.tsx aswell
