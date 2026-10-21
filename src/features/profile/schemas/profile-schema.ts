import { z } from "zod"

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50, "First name cannot exceed 50 characters."),
  lastName: z.string().trim().min(1, "Last name is required.").max(50, "Last name cannot exceed 50 characters."),
  personalEmail: z.union([z.string().trim().check(z.email("Invalid personal email address.")).toLowerCase(), z.literal("")], { error: "Enter a valid personal email address, or leave it blank." }),
  phone: z.string().trim().max(30, "Phone number cannot exceed 30 characters."),
  location: z.string().trim().max(255, "Location cannot exceed 255 characters."),
  bio: z.string().trim().max(1000, "Bio cannot exceed 1000 characters."),
})

export type ProfileValues = z.infer<typeof profileSchema>
