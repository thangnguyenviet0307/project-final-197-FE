import type { RefObject } from "react"
import { useBlocker } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export function DiscardDialog({ open, keep, discard }: { open: boolean; keep: () => void; discard: () => void }) {
  return <Dialog open={open} onOpenChange={value => { if (!value) keep() }}>
    <DialogContent><DialogHeader><DialogTitle>Bỏ các thay đổi chưa lưu?</DialogTitle><DialogDescription>Các thay đổi chưa được lưu. Nếu rời trang, bạn sẽ mất các thay đổi này.</DialogDescription></DialogHeader>
      <DialogFooter><Button type="button" variant="outline" onClick={keep}>Tiếp tục chỉnh sửa</Button><Button type="button" variant="destructive" onClick={discard}>Bỏ thay đổi</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

export function RouteGuard({ dirty, saved }: { dirty: boolean; saved: RefObject<boolean> }) {
  const blocker = useBlocker(() => dirty && !saved.current)
  return <DiscardDialog open={blocker.state === "blocked"} keep={() => { if (blocker.state === "blocked") blocker.reset() }} discard={() => { if (blocker.state === "blocked") blocker.proceed() }} />
}

