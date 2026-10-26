import { useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BrandForm } from "@/features/brands/components/brand-form"
import type { IBrand, CreateBrandInput } from "@/features/brands/types/brands"

export function BrandFormDialog({ brand, onSubmit, submitLabel = "Lưu thay đổi" }: { brand: IBrand; onSubmit: (values: CreateBrandInput) => Promise<void> | void; submitLabel?: string }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  return <>
    <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${brand.name}`} onClick={() => setOpen(true)}><Pencil /></Button>
    <Dialog open={open} onOpenChange={next => { if (!saving) setOpen(next) }}>
      <DialogContent showCloseButton={!saving} className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Chỉnh sửa thương hiệu</DialogTitle><DialogDescription>Cập nhật thông tin thương hiệu bên dưới.</DialogDescription></DialogHeader>
        <BrandForm key={brand._id} brand={brand} submitLabel={submitLabel} onCancel={() => setOpen(false)} onSubmit={async values => {
          setSaving(true)
          try { await onSubmit(values); setOpen(false) } finally { setSaving(false) }
        }} />
      </DialogContent>
    </Dialog>
  </>
}
