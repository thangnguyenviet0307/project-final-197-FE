import { z } from "zod"

export const imageUrlSchema = z.string({ error: "Enter an image URL." }).trim().max(255, "Image URL cannot exceed 255 characters.").refine(
  value => !value || (URL.canParse(value) && /^https?:\/\//i.test(value)),
  "Enter a valid HTTP or HTTPS image URL.",
)
