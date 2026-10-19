import { z } from "zod";
import { imageUrlSchema } from "@/utils/image-url";
import { api } from "@/services/api";

export const categorySchema = z.object({
  icon: imageUrlSchema.optional(),
  name: z.string().trim().min(1, "Tên danh mục không được để trống"),
  description: z.string().trim().optional(),
  parent: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

export interface CategoryParent {
  _id: string;
  name: string;
  slug?: string;
}

export interface Category {
  icon?: string;
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: CategoryParent | string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  icon?: string;
  name: string;
  description?: string;
  parent?: string | null;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  icon?: string;
  name?: string;
  description?: string;
  parent?: string | null;
  isActive?: boolean;
}

export async function listCategories(signal?: AbortSignal): Promise<Category[]> {
  const { data } = await api.get<{ success: boolean; count: number; data: Category[] }>("/categories", { signal });
  return data.data || [];
}

export async function getCategoryById(id: string, signal?: AbortSignal): Promise<Category> {
  const { data } = await api.get<{ success: boolean; data: Category }>(
    `/categories/${encodeURIComponent(id)}`,
    { signal }
  );
  return data.data;
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const payload = {
    name: input.name,
    ...(input.icon !== undefined ? { icon: input.icon } : {}),
    description: input.description || "",
    parent: input.parent ? input.parent : null,
    isActive: input.isActive ?? true,
  };
  const { data } = await api.post<{ success: boolean; data: Category }>("/categories", payload);
  return data.data;
}

export async function updateCategory({
  id,
  input,
}: {
  id: string;
  input: UpdateCategoryInput;
}): Promise<Category> {
  const payload: Record<string, unknown> = {};
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.parent !== undefined) payload.parent = input.parent ? input.parent : null;
  if (input.isActive !== undefined) payload.isActive = input.isActive;

  const { data } = await api.put<{ success: boolean; data: Category }>(
    `/categories/${encodeURIComponent(id)}`,
    payload
  );
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${encodeURIComponent(id)}`);
}
