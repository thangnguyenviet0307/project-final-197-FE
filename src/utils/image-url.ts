import { z } from "zod"

export const imageUrlSchema = z.string().trim().max(255).refine(
  value => !value || (URL.canParse(value) && /^https?:\/\//i.test(value)),
  "Enter a valid HTTP or HTTPS image URL.",
)
