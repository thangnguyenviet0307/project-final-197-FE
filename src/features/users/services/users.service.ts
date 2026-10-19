import { z } from "zod";
import { api } from "@/services/api";
import type { ApiResponse } from "@/features/auth/types/auth";
import { passwordSchema } from "@/features/auth/schemas/auth-schemas";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(50),
  lastName: z.string().trim().min(1, "Last name is required.").max(50),
  email: z.string().trim().email("Invalid email address.").toLowerCase(),
  password: passwordSchema,
  role: z.enum(["admin", "staff"]),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export function getDefaultUserPassword(role: "admin" | "staff") {
  return role === "admin" ? "Admin123" : "Staff123"
}

// Password resets generate a separate cryptographically random password.
export function getTemporaryPassword(role: "admin" | "staff") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_"
  const bytes = crypto.getRandomValues(new Uint8Array(20))
  return `${role === "admin" ? "A" : "S"}a7!${Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("")}`
}

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

export async function listUsers(
  page: number,
  signal: AbortSignal,
  search = "",
  limit = 10,
) {
  const { data } = await api.get<
    ApiResponse<ManagedUser[]> & {
      pagination: { totalPages: number; total: number };
    }
  >("/users", {
    params: { page, limit, ...(search ? { search } : {}) },
    signal,
  });
  return data;
}

export async function createUser(input: CreateUserInput) {
  await api.post("/users", { ...input, active: true });
}

export async function resetUserPassword({
  id,
  password,
}: {
  id: string;
  password: string;
}) {
  await api.put(`/users/${encodeURIComponent(id)}`, { password });
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${encodeURIComponent(id)}`);
}
