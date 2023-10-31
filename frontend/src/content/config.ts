import { z, defineCollection } from "astro:content";

const eventsCollection = defineCollection({
  type: "content", // v2.5.0 and later
  schema: z.object({
    title: z.string(),
    type: z.enum(["social", "speaker", "swap", "competition"]),
    location: z.string(),
    date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});

const newsletterCollection = defineCollection({});

// This key should match your collection directory name in "src/content"
export const collections = {
  events: eventsCollection,
  newsletter: newsletterCollection,
};
