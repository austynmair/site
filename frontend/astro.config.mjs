import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), tailwind(), compress()],
  output: "hybrid",
  adapter: node({
    mode: "standalone",
  }),
});
