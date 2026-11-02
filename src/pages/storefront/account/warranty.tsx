import { Link, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { WarrantyCreateForm } from "@/features/support/components/warranty-create-form"
import { WarrantyList } from "@/features/support/components/warranty-list"
import { WarrantyDetailPanel } from "@/features/support/components/warranty-detail"
import { warrantyIdSchema } from "@/features/support/schemas/support-schema"

export default function CustomerWarrantyPage() {
  const [params, setParams] = useSearchParams()
  const creating = params.get("new") === "1"
  const selected = params.get("request") ?? ""
  function select(id: string) { setParams(previous => { const next = new URLSearchParams(previous); next.set("request", id); next.delete("new"); return next }) }
  return <div className="space-y-6"><header><h2 className="text-2xl font-bold">Bảo hành của tôi</h2><p className="mt-2 text-sm leading-6 text-gray-500">Gửi yêu cầu cho sản phẩm trong đơn đã hoàn tất và theo dõi phản hồi của cửa hàng.</p><Link to="/chinh-sach-bao-hanh" className="mt-3 inline-block text-sm font-semibold text-green-700 underline">Xem chính sách & bảo hành</Link></header>
    {!creating && <Button onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete("request"); next.set("new", "1"); return next })}>Tạo yêu cầu bảo hành</Button>}
    {creating && <WarrantyCreateForm onCreated={select} onCancel={() => setParams(previous => { const next = new URLSearchParams(previous); next.delete("new"); return next })} />}
    <WarrantyList admin={false} selectedId={selected} onSelect={select} />
    {!creating && selected && (warrantyIdSchema.safeParse(selected).success ? <WarrantyDetailPanel key={selected} id={selected} admin={false} /> : <p role="alert">Mã yêu cầu trên đường dẫn không hợp lệ. Hãy chọn yêu cầu từ danh sách.</p>)}
  </div>
}
