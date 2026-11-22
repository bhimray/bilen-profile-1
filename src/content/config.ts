import { defineCollection, z } from "astro:content"

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    platform: z.string(),
    order: z.number().int(),
    tags: z.array(z.string()),
    kind: z.enum(["research", "engineering"]),
  }),
})

export const collections = { projects }
