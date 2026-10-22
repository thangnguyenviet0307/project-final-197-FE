
import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface StoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function StoreModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "",
}: StoreModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto sm:max-w-xl ${className}`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-3">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
