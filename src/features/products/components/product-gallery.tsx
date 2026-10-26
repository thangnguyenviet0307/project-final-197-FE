import { useEffect, useRef, useState } from "react"
import { LoaderCircle, Trash2, Upload } from "lucide-react"
import type { Product } from "@/features/products/types/products"
import { useProductImages } from "@/features/products/hooks/use-product-images"
import { ProductImage } from "@/features/products/components/product-image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getApiError } from "@/services/api"

export function ProductGallery({ product }: { product: Product }) {
  const { upload, remove } = useProductImages()
  const [selected, setSelected] = useState<{ file: File; url: string } | null>(null)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const pending = upload.isPending || remove.isPending
  const images = product.images ?? []
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected.url) }, [selected])
  return <section className="space-y-4 rounded-lg border p-4" aria-label="Quản lý ảnh sản phẩm">
    <h2 className="font-semibold">Ảnh sản phẩm ({images.length}/8)</h2>
    <p className="text-sm text-muted-foreground">Tải ảnh JPG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh. Ảnh mới được lưu trên Cloudinary.</p>
    <div className="flex flex-wrap gap-3">{images.map(image => <div key={image.public_id} className="space-y-2">
      <ProductImage src={image.secure_url} alt={product.product_name} className="size-24 border" />
      <Button type="button" size="sm" variant="outline" disabled={pending} aria-label={`Xóa ảnh thư viện ${image.public_id}`} onClick={() => { remove.reset(); setDeleting(image.public_id) }}><Trash2 />Xóa</Button>
    </div>)}</div>
    <label className="block space-y-2 text-sm"><span>Chọn ảnh sản phẩm</span><Input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={pending || images.length >= 8} onChange={event => {
      setError(""); upload.reset(); setSelected(null); setProgress(0)
      const file = event.target.files?.[0]
      if (!file) return
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size) {
        setError("Chọn ảnh JPG, PNG hoặc WebP hợp lệ, dung lượng không quá 5 MB."); event.target.value = ""; return
      }
      setSelected({ file, url: URL.createObjectURL(file) })
    }} /></label>
    {selected && <ProductImage src={selected.url} alt="Xem trước ảnh đã chọn" className="size-32 border" />}
    {(error || upload.error) && <p role="alert" className="text-sm text-destructive">{error || getApiError(upload.error).message}</p>}
    {upload.isPending && <p role="status">{progress < 100 ? `Đang tải ảnh lên… ${progress}%` : "Đang xử lý ảnh…"}</p>}
    {images.length >= 8 && <p className="text-sm text-muted-foreground">Thư viện ảnh đã đầy. Hãy xóa một ảnh trước khi tải ảnh mới.</p>}
    <Button type="button" disabled={!selected || pending || images.length >= 8} onClick={() => {
      if (!selected) return
      upload.mutate({ id: product._id, file: selected.file, onProgress: setProgress }, { onSuccess: () => { setSelected(null); if (input.current) input.current.value = "" } })
    }}>{upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />}Tải ảnh lên</Button>
    <Dialog open={deleting !== null} onOpenChange={open => { if (!open && !remove.isPending) setDeleting(null) }}>
      <DialogContent showCloseButton={!remove.isPending}><DialogHeader><DialogTitle>Xóa ảnh trong thư viện?</DialogTitle><DialogDescription>Thao tác này xóa ảnh khỏi thư viện sản phẩm và Cloudinary, không thể hoàn tác.</DialogDescription></DialogHeader>
        {remove.error && <p role="alert" className="text-sm text-destructive">{getApiError(remove.error).message}</p>}
        <DialogFooter><Button variant="outline" disabled={remove.isPending} onClick={() => setDeleting(null)}>Hủy</Button><Button variant="destructive" disabled={remove.isPending} onClick={() => {
          if (deleting) remove.mutate({ id: product._id, publicId: deleting }, { onSuccess: () => setDeleting(null) })
        }}>{remove.isPending && <LoaderCircle className="animate-spin" />}Xác nhận xóa ảnh</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
}
