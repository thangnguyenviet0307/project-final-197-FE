
import type { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface StoreDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  side?: "left" | "right"
  className?: string
}

export function StoreDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
  className = "",
}: StoreDrawerProps) {
  const positionClass =
    side === "left"
      ? "!left-0 !right-auto !translate-x-0 rounded-r-xl"
      : "!right-0 !left-auto !translate-x-0 rounded-l-xl"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          "fixed !top-0 !translate-y-0",
          "flex !h-dvh !max-h-dvh w-[min(100vw,400px)]",
          "flex-col overflow-y-auto !rounded-none",
          "p-6 sm:!max-w-[400px]",
          positionClass,
          className,
        ].join(" ")}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
