import { z } from "zod"

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50),
  lastName: z.string().trim().min(1, "Last name is required.").max(50),
  personalEmail: z.union([z.string().trim().email("Invalid personal email address.").toLowerCase(), z.literal("")]),
  phone: z.string().trim().max(30),
  location: z.string().trim().max(255),
  bio: z.string().trim().max(1000),
})

export type ProfileValues = z.infer<typeof profileSchema>
