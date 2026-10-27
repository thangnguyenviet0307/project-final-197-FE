import type { z } from "zod";
import type { createUserSchema } from "@/features/users/schemas/user-schema";

export type CreateUserInput = z.infer<typeof createUserSchema>;

export interface ManagedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "staff";
  active: boolean;
  mustChangePassword?: boolean;
  personalEmail?: string;
  phone?: string;
  avatar?: string;
  location?: string;
  bio?: string;
}

export interface UsersFilters { role?: ManagedUser["role"]; active?: boolean; sortBy?: "username"; sortOrder?: "asc" | "desc" }
