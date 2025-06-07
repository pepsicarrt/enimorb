// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";


import netlify from "@astrojs/netlify";


export default defineConfig({
  integrations: [icon(), (await import("@playform/compress")).default()],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  adapter: netlify({
    edgeMiddleware: true
  }),
});
