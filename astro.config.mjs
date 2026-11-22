import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"

const site = process.env.SITE_URL || undefined

export default defineConfig({
  site,
  integrations: [
    mdx(),
    solidJs(),
    tailwind({ applyBaseStyles: false }),
    ...(site ? [sitemap()] : []),
  ],
})
