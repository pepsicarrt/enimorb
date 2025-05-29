// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import icon from "astro-icon";
// import netlify from "@astrojs/netlify";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

import node from "@astrojs/node";

import vercel from "@astrojs/vercel";

// import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  integrations: [icon(), (await import("@playform/compress")).default()],

  vite: {
    plugins: [
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: uvPath,
            dest: "",
            rename: "uv",
            overwrite: false,
          },
          {
            src: epoxyPath,
            dest: "",
            rename: "epoxy",
            overwrite: false,
          },
          {
            src: bareModulePath,
            dest: "",
            rename: "baremod",
            overwrite: false,
          },
          {
            src: baremuxPath,
            dest: "",
            rename: "baremux",
          },
        ],
      }),
    ],
  },

  // adapter: netlify(),
  // adapter: cloudflare(),
  output: "server",

  adapter: vercel(),
});