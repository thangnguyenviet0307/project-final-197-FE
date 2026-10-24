import { api } from "@/services/api";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/features/categories/types/categories";
import type { ApiResult } from "@/types/api";

export async function listCategories(signal?: AbortSignal): Promise<Category[]> {
  const { data } = await api.get<ApiResult<Category[]> & { count: number }>("/categories", { signal });
  return data.data || [];
}

export async function getCategoryById(id: string, signal?: AbortSignal): Promise<Category> {
  const { data } = await api.get<ApiResult<Category>>(
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
  const { data } = await api.post<ApiResult<Category>>("/categories", payload);
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

  const { data } = await api.put<ApiResult<Category>>(
    `/categories/${encodeURIComponent(id)}`,
    payload
  );
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${encodeURIComponent(id)}`);
}
