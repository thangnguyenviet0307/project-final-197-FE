import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteProductImage, uploadProductImage } from "@/features/products/services/products.service"

export function useProductImages() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: ["products"] })
  const upload = useMutation({ mutationFn: uploadProductImage, meta: { successMessage: "Tải ảnh lên thành công." }, onSuccess: refresh })
  const remove = useMutation({ mutationFn: deleteProductImage, meta: { successMessage: "Đã xóa ảnh khỏi thư viện." }, onSuccess: result => {
    if (result.cleanupPending) toast.warning("Đã xóa ảnh khỏi thư viện. Quản trị viên cần kiểm tra việc xóa ảnh trên Cloudinary.")
    return refresh()
  } })
  return { upload, remove }
}
