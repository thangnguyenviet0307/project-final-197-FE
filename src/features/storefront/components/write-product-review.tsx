import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star, PencilLine } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ProductImage } from "@/features/products/components/product-image"
import type { Product } from "@/features/products/types/products"
import { storeReviewSchema, type StoreReviewInput } from "@/features/storefront/schemas/store-review-schema"
import { useCreateStoreReview } from "@/features/storefront/hooks/use-store-products"
import { getApiError } from "@/services/api"

const labels = ["Rất tệ", "Tệ", "Tạm ổn", "Tốt", "Rất tốt"]
export function WriteProductReview({ product, onSubmitted }: { product: Product; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const mutation = useCreateStoreReview()
  const form = useForm<StoreReviewInput>({ resolver: zodResolver(storeReviewSchema), defaultValues: { rating: 0, reviewerName: "", email: "", phone: "", comment: "" } })
  const rating = useWatch({ control: form.control, name: "rating" })
  const errors = form.formState.errors
  return <div className="my-6 flex flex-col items-center gap-3 border-y border-gray-100 py-6">
    <button type="button" onClick={() => { setSubmitted(false); setOpen(true) }} className="inline-flex items-center gap-2 rounded-xl bg-[#4d9210] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#3f7c0c]"><PencilLine size={17} />Viết đánh giá</button>
    {submitted && <p role="status" className="text-center text-sm text-[#4d9210]">Cảm ơn bạn! Đánh giá đã được gửi thành công.</p>}
    <Dialog open={open} onOpenChange={next => { if (!mutation.isPending) setOpen(next) }}>
      <DialogContent showCloseButton={!mutation.isPending} className="max-h-[90dvh] overflow-y-auto rounded-3xl bg-white p-5 text-gray-900 sm:max-w-2xl sm:p-8">
        <DialogHeader className="border-b border-gray-200 pb-5 text-center"><DialogTitle className="text-center text-xl font-bold">Đánh giá sản phẩm</DialogTitle><DialogDescription className="text-center text-gray-500">Chọn số sao để chia sẻ đánh giá của bạn.</DialogDescription></DialogHeader>
        <form noValidate onSubmit={form.handleSubmit(async input => {
          form.clearErrors("root")
          try {
            await mutation.mutateAsync({ slug: product.slug ?? "", input })
            onSubmitted(); setOpen(false); form.reset(); setSubmitted(true)
          } catch (error: unknown) { form.setError("root", { message: getApiError(error).message }) }
        })} className="space-y-6">
          <ProductImage src={product.thumbnail || product.images?.[0]?.secure_url || product.sourceImages?.[0]} alt={product.product_name} className="mx-auto mt-4 h-28 w-28 object-contain" />
          <p className="text-center text-lg font-bold sm:text-xl">{product.product_name}</p>
          <fieldset disabled={mutation.isPending}><legend className="sr-only">Chọn số sao</legend><div className="mx-auto flex max-w-md justify-center gap-2 sm:gap-5">{labels.map((label, index) => <button key={label} type="button" aria-label={`${index + 1} sao - ${label}`} aria-pressed={rating === index + 1} onClick={() => form.setValue("rating", index + 1, { shouldDirty: true, shouldValidate: true })} className="flex min-w-0 flex-1 flex-col items-center gap-2 rounded-lg py-2 focus-visible:outline-2 focus-visible:outline-amber-500"><Star className={`size-8 sm:size-11 ${index < rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} /><span className={`text-xs sm:text-sm ${rating === index + 1 ? "font-semibold text-amber-600" : "text-gray-500"}`}>{label}</span></button>)}</div></fieldset>
          {rating > 0 && <fieldset disabled={mutation.isPending} className="space-y-4">
            <div><label htmlFor="store-review-comment" className="mb-2 block text-sm font-medium">Đánh giá của bạn <span className="text-red-500">*</span></label><textarea id="store-review-comment" rows={4} maxLength={2000} placeholder="Mời bạn chia sẻ thêm cảm nhận…" aria-invalid={!!errors.comment} aria-describedby={errors.comment ? "review-comment-error" : undefined} {...form.register("comment")} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm outline-none focus:border-[#57952b]" />{errors.comment && <p id="review-comment-error" className="text-sm text-red-600">{errors.comment.message}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">{([
              ["reviewerName", "Họ tên (bắt buộc)", "text", "name", 100], ["email", "Email", "email", "email", 254], ["phone", "Số điện thoại", "tel", "tel", 20],
            ] as const).map(([field, label, type, autoComplete, maxLength]) => <div key={field}><label htmlFor={`store-review-${field}`} className="mb-2 block text-sm font-medium">{label}</label><input id={`store-review-${field}`} type={type} autoComplete={autoComplete} maxLength={maxLength} aria-required={field === "reviewerName"} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `review-${field}-error` : undefined} {...form.register(field)} className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#57952b]" />{errors[field] && <p id={`review-${field}-error`} className="mt-1 text-sm text-red-600">{errors[field]?.message}</p>}</div>)}</div>
            <p className="text-xs leading-5 text-gray-500">Email và số điện thoại không bắt buộc và không hiển thị công khai. Tên, số sao và nội dung đánh giá sẽ được hiển thị trên trang sản phẩm.</p>
            {errors.root && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{errors.root.message}</p>}
            <button type="submit" disabled={mutation.isPending} className="w-full rounded-xl bg-[#4d9210] py-3.5 text-sm font-bold text-white hover:bg-[#3f7c0c] disabled:opacity-50">{mutation.isPending ? "Đang gửi…" : "Gửi đánh giá"}</button>
          </fieldset>}
        </form>
      </DialogContent>
    </Dialog>
  </div>
}
