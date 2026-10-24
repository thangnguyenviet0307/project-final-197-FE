import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { brandsService } from "@/features/brands/services/brands.service"
import type { UpdateBrandInput } from "@/features/brands/types/brands"
import { invalidateCatalog } from "@/features/products/utils/invalidate-catalog"

export function useBrandManagement() {
  return useQuery({
    queryKey: ["brands", "management"],
    queryFn: ({ signal }) => brandsService.getBrands(signal),
  })
}

export function useCreateBrand() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: brandsService.createBrand,
    meta: { successMessage: "Brand created." },
    onSuccess: () => invalidateCatalog(client, "brands"),
  })
}

export function useUpdateBrand() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateBrandInput }) => brandsService.updateById(id, values),
    onSuccess: () => invalidateCatalog(client, "brands"),
  })
}

export function useDeleteBrand() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: brandsService.deleteById,
    onSuccess: () => invalidateCatalog(client, "brands"),
  })
}
