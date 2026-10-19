import type { RefObject } from "react"
import { useBlocker } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export function DiscardDialog({ open, keep, discard }: { open: boolean; keep: () => void; discard: () => void }) {
  return <Dialog open={open} onOpenChange={value => { if (!value) keep() }}>
    <DialogContent><DialogHeader><DialogTitle>Discard unsaved changes?</DialogTitle><DialogDescription>Your changes have not been saved. Leaving will discard them.</DialogDescription></DialogHeader>
      <DialogFooter><Button type="button" variant="outline" onClick={keep}>Keep editing</Button><Button type="button" variant="destructive" onClick={discard}>Discard changes</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

export function RouteGuard({ dirty, saved }: { dirty: boolean; saved: RefObject<boolean> }) {
  const blocker = useBlocker(() => dirty && !saved.current)
  return <DiscardDialog open={blocker.state === "blocked"} keep={() => { if (blocker.state === "blocked") blocker.reset() }} discard={() => { if (blocker.state === "blocked") blocker.proceed() }} />
}

