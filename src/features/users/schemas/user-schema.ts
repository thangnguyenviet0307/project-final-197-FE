import { z } from "zod";
import { passwordSchema } from "@/features/auth/schemas/auth-schemas";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50, "First name cannot exceed 50 characters."),
  lastName: z.string().trim().min(1, "Last name is required.").max(50, "Last name cannot exceed 50 characters."),
  email: z.string().trim().email("Invalid email address.").toLowerCase(),
  password: passwordSchema,
  role: z.enum(["admin", "staff"], { error: "Select Admin or Staff." }),
});

