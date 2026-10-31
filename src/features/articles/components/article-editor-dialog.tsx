import { useState, type ReactNode } from "react"
import { Dialog } from "@/components/ui/dialog"
import { useUnsavedForm } from "@/hooks/use-unsaved-form"

export function ArticleEditorDialog({ pending, close, children }: {
  pending: boolean; close: () => void; children: (onDirtyChange: (dirty: boolean) => void) => ReactNode
}) {
  const [dirty, setDirty] = useState(false)
  const navigation = useUnsavedForm(dirty)
  return <><Dialog open onOpenChange={open => { if (!open && !pending) navigation.confirmDiscard(close) }}>{children(setDirty)}</Dialog>{navigation.guard}</>
}
