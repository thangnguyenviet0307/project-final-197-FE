import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ListPagination } from "@/components/list-pagination"
import { useProductReviews } from "@/features/products/hooks/use-product-reviews"
import { productReviewSchema } from "@/features/products/schemas/product-review-schema"
import type { ProductReviewInput } from "@/features/products/types/products"
import { useAuthStore } from "@/stores/auth.store"
import { getApiError } from "@/services/api"

export function ProductReviews({ id }: { id: string }) {
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const admin = useAuthStore(state => state.user?.role === "admin")
  const { metrics, reviews, create, remove } = useProductReviews(id, page)
  const form = useForm<ProductReviewInput>({ resolver: zodResolver(productReviewSchema), defaultValues: { reviewerName: "", rating: 5, comment: "" } })
  return <section className="space-y-5 rounded-lg border p-4" aria-label="Đánh giá sản phẩm">
    <h2 className="text-lg font-semibold">Đánh giá và doanh số</h2>
    {metrics.isPending ? <p role="status">Đang tải thống kê đánh giá…</p> : metrics.isError ? <div role="alert">{getApiError(metrics.error).message} <Button variant="outline" onClick={() => void metrics.refetch()}>Tải lại thống kê đánh giá</Button></div> : metrics.data &&
      <dl className="grid gap-4 sm:grid-cols-3">{[
        ["Điểm đánh giá", metrics.data.reviewCount ? `${metrics.data.rating}/5` : "Chưa có đánh giá"],
        ["Số đánh giá", metrics.data.reviewCount], ["Đã bán (đơn hoàn tất)", metrics.data.soldCount],
      ].map(([label, value]) => <div key={label} className="rounded-lg bg-muted p-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 text-xl font-semibold">{value}</dd></div>)}</dl>}
    {reviews.isPending ? <p role="status">Đang tải đánh giá…</p> : reviews.isError ? <div role="alert">{getApiError(reviews.error).message} <Button variant="outline" onClick={() => void reviews.refetch()}>Tải lại đánh giá</Button></div> : <>
      {!reviews.data?.data.length && <p className="text-sm text-muted-foreground">Chưa có đánh giá ở trang này.</p>}
      {reviews.data?.data.map(review => <article key={review._id} className="space-y-2 border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-words font-medium">{review.reviewerName}</h3><span aria-label={`${review.rating} trên 5 sao`} className="text-sm font-medium">★ {review.rating}/5</span></div>
        <p className="text-xs text-muted-foreground">{review.date ? new Date(review.date).toLocaleString("vi-VN") : "Chưa có ngày"} · {review.source === "storefront" ? "Người dùng gửi" : review.source === "dummyjson" ? "Nhập từ DummyJSON" : "Quản trị viên thêm"}</p>
        <p className="whitespace-pre-wrap break-words text-sm">{review.comment}</p>
        {admin && <Button variant="outline" disabled={remove.isPending} onClick={() => { remove.reset(); setDeleting(review._id) }} aria-label={`Xóa đánh giá của ${review.reviewerName}`}>Xóa đánh giá</Button>}
      </article>)}
      <ListPagination label="Phân trang đánh giá" page={page} totalPages={Math.max(1, reviews.data?.pagination.totalPages ?? 1)} disabled={reviews.isFetching || remove.isPending} onPageChange={setPage} />
    </>}
    {admin && <form noValidate className="space-y-4 rounded-lg bg-muted/40 p-4" onSubmit={form.handleSubmit(async input => {
      form.clearErrors("root")
      try { await create.mutateAsync({ id, input }); form.reset(); setPage(1) }
      catch (error: unknown) { form.setError("root", { message: getApiError(error).message }) }
    })}>
      <h3 className="font-medium">Thêm đánh giá do quản trị viên ghi nhận</h3>
      <fieldset disabled={create.isPending} className="grid gap-4 sm:grid-cols-2">
        <Field><FieldLabel htmlFor="reviewerName">Người đánh giá</FieldLabel><Input id="reviewerName" maxLength={100} aria-invalid={!!form.formState.errors.reviewerName} {...form.register("reviewerName")} /><FieldError errors={[form.formState.errors.reviewerName]} /></Field>
        <Field><FieldLabel htmlFor="rating">Số sao (1–5)</FieldLabel><Input id="rating" type="number" min={1} max={5} step={1} aria-invalid={!!form.formState.errors.rating} {...form.register("rating", { valueAsNumber: true })} /><FieldError errors={[form.formState.errors.rating]} /></Field>
        <Field className="sm:col-span-2"><FieldLabel htmlFor="review-comment">Nội dung đánh giá</FieldLabel><Textarea id="review-comment" maxLength={2000} aria-invalid={!!form.formState.errors.comment} {...form.register("comment")} /><FieldError errors={[form.formState.errors.comment]} /></Field>
      </fieldset>
      {form.formState.errors.root && <p role="alert" className="text-destructive">{form.formState.errors.root.message}</p>}
      <Button type="submit" disabled={create.isPending}>{create.isPending ? "Đang thêm…" : "Thêm đánh giá"}</Button>
    </form>}
    <Dialog open={!!deleting} onOpenChange={open => { if (!open && !remove.isPending) setDeleting(null) }}>
      <DialogContent showCloseButton={!remove.isPending}><DialogHeader><DialogTitle>Xóa đánh giá?</DialogTitle><DialogDescription>Đánh giá sẽ bị xóa và điểm trung bình sẽ được cập nhật.</DialogDescription></DialogHeader>
        {remove.isError && <p role="alert" className="text-destructive">{getApiError(remove.error).message}</p>}
        <DialogFooter><Button variant="outline" disabled={remove.isPending} onClick={() => setDeleting(null)}>Hủy</Button><Button variant="destructive" disabled={remove.isPending} onClick={async () => {
          if (!deleting) return
          try {
            await remove.mutateAsync({ id, reviewId: deleting })
            setDeleting(null)
            if (reviews.data?.data.length === 1 && page > 1) setPage(page - 1)
          } catch { /* Keep the dialog open with the actionable API error. */ }
        }}>Xác nhận xóa</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
}
