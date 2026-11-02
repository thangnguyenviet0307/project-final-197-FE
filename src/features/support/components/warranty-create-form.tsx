import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ListPagination } from "@/components/list-pagination"
import { useEligibleWarrantyOrders, useSupportMutations } from "@/features/support/hooks/use-support"
import { createWarrantySchema } from "@/features/support/schemas/support-schema"
import type { CreateWarrantyInput } from "@/features/support/types/support"
import { getApiError } from "@/services/api"
import { useUnsavedForm } from "@/hooks/use-unsaved-form"

export function WarrantyCreateForm({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel: () => void }) {
  const [page, setPage] = useState(1)
  const query = useEligibleWarrantyOrders(page)
  const [selection, setSelection] = useState<{ orderId: string; itemIndex: number; label: string } | null>(null)
  const [description, setDescription] = useState("")
  const [pendingInput, setPendingInput] = useState<CreateWarrantyInput | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [error, setError] = useState("")
  const mutation = useSupportMutations().create
  const navigation = useUnsavedForm(description.length > 0 || pendingInput !== null)
  async function submit() {
    const parsed = createWarrantySchema.safeParse(pendingInput ?? { requestId: crypto.randomUUID(), orderId: selection?.orderId, itemIndex: selection?.itemIndex, description })
    if (!parsed.success) { setError(selection ? parsed.error.issues[0].message : "Vui lòng chọn sản phẩm trong đơn đã hoàn tất."); return }
    setPendingInput(parsed.data); setError(""); setCanEdit(false)
    try {
      const result = await mutation.mutateAsync(parsed.data)
      setPendingInput(null); setDescription(""); setSelection(null)
      navigation.allowSavedNavigation()
      onCreated(result._id)
    } catch (failure) {
      const apiError = getApiError(failure)
      setError(apiError.message)
      setCanEdit([400, 404, 409, 413].includes(apiError.statusCode))
    }
  }
  return <section className="rounded-2xl border p-5 sm:p-6"><h3 className="text-xl font-bold">Gửi yêu cầu bảo hành</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Chọn sản phẩm đã mua. Sau khi gửi, bạn có thể bổ sung ảnh trước khi nhân viên tiếp nhận. Cửa hàng sẽ kiểm tra điều kiện bảo hành trước khi xác nhận phương án.</p>
    {query.isPending ? <p role="status" className="mt-4">Đang tải đơn đã hoàn tất…</p> : query.isError ? <div role="alert" className="mt-4"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></div> : <>
      {!query.data.data.length && <p className="mt-4 text-sm">{page > 1 ? "Không có đơn ở trang này." : "Chưa có đơn đã hoàn tất. Đơn khách vãng lai cần liên hệ cửa hàng bằng mã đơn đã lưu."} <Link to="/contact" className="underline">Liên hệ</Link></p>}
      <fieldset disabled={pendingInput !== null || mutation.isPending} className="mt-4 space-y-3"><legend className="mb-3 font-semibold">Sản phẩm trong đơn đã hoàn tất</legend>
        {query.data.data.map(order => <div key={order._id} className="rounded-xl border bg-muted/20 p-3"><p className="mb-2 text-sm font-semibold">{order.orderCode}</p>{order.items.map(item => <label key={item.itemIndex} className="flex cursor-pointer gap-3 py-2 text-sm"><input type="radio" name="warranty-product" checked={selection?.orderId === order._id && selection.itemIndex === item.itemIndex} onChange={() => setSelection({ orderId: order._id, itemIndex: item.itemIndex, label: `${order.orderCode} · ${item.productName}${item.variantName ? ` · ${item.variantName}` : ""}` })} /><span>{item.productName}{item.variantName && ` · ${item.variantName}`} <span className="text-muted-foreground">(đã mua {item.quantity})</span></span></label>)}</div>)}
      </fieldset>
      {query.data.pagination.totalPages > 1 && <ListPagination label="Chọn đơn để bảo hành" page={page} totalPages={query.data.pagination.totalPages} disabled={query.isFetching || pendingInput !== null} onPageChange={setPage} />}
    </>}
    {selection && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">Đã chọn: {selection.label}</p>}
    <form onSubmit={event => { event.preventDefault(); void submit() }} className="mt-5 space-y-3">
      <label htmlFor="warranty-description" className="font-semibold">Mô tả tình trạng lỗi</label>
      <textarea id="warranty-description" rows={5} minLength={10} maxLength={3000} required disabled={pendingInput !== null || mutation.isPending} value={description} onChange={event => setDescription(event.target.value)} placeholder="Sản phẩm gặp lỗi gì, xuất hiện khi nào và bạn đã kiểm tra như thế nào?" className="w-full rounded-lg border bg-background p-3 text-sm leading-6" />
      <p className="text-xs text-muted-foreground">Không nhập mật khẩu, mã xác thực hoặc thông tin thanh toán.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {pendingInput && !mutation.isPending && !canEdit && <p role="status" className="text-sm">Chưa xác nhận được kết quả gửi. Bấm thử lại với cùng nội dung để tránh tạo trùng yêu cầu. Giữ trang này mở đến khi có kết quả.</p>}
      <div className="flex flex-wrap gap-3"><Button type="submit" disabled={mutation.isPending || (!selection && !pendingInput)}>{mutation.isPending ? "Đang gửi…" : pendingInput ? "Thử gửi lại yêu cầu" : "Gửi yêu cầu"}</Button>{pendingInput && canEdit && <Button type="button" variant="outline" onClick={() => { setPendingInput(null); setError("") }}>Chỉnh sửa thông tin</Button>}<Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => navigation.confirmDiscard(onCancel)}>Đóng biểu mẫu</Button></div>
    </form>{navigation.guard}
  </section>
}
