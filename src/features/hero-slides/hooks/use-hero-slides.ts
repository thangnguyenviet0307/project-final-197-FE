import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import * as service from "@/features/hero-slides/services/hero-slides.service"
export function useHeroSlides() { return useQuery({ queryKey: ["hero-slides", "admin"], queryFn: ({ signal }) => service.listHeroSlides(signal) }) }
export function usePublicHeroSlides() { return useQuery({ queryKey: ["hero-slides", "public"], queryFn: ({ signal }) => service.listPublicHeroSlides(signal) }) }
export function useHeroSlideMutations() {
  const client = useQueryClient()
  const onSuccess = () => client.invalidateQueries({ queryKey: ["hero-slides"] })
  return {
    create: useMutation({ mutationFn: service.createHeroSlide, onSuccess, meta: { successMessage: "Đã thêm slide.", suppressGlobalErrorToast: true } }),
    update: useMutation({ mutationFn: service.updateHeroSlide, onSuccess, meta: { successMessage: "Đã cập nhật slide.", suppressGlobalErrorToast: true } }),
    remove: useMutation({ mutationFn: service.deleteHeroSlide, onSuccess, meta: { successMessage: "Đã xóa slide.", suppressGlobalErrorToast: true } }),
  }
}
