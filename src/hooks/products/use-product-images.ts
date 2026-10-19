import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { deleteProductImage, uploadProductImage } from "@/services/products.service"

export function useProductImages() {
  const client = useQueryClient()
  const refresh = () => client.invalidateQueries({ queryKey: ["products"] })
  const upload = useMutation({ mutationFn: uploadProductImage, meta: { successMessage: "Image uploaded successfully." }, onSuccess: refresh })
  const remove = useMutation({ mutationFn: deleteProductImage, meta: { successMessage: "Image removed from gallery." }, onSuccess: result => {
    if (result.cleanupPending) toast.warning("The image was removed from the gallery, but Cloudinary cleanup needs administrator attention.")
    return refresh()
  } })
  return { upload, remove }
}
