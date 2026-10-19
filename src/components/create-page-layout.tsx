import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"

export function CreatePageLayout({ title, backTo, backLabel, children }: { title: string; backTo: string; backLabel: string; children: ReactNode }) {
  return <BaseLayout title={title}><div className="space-y-4 px-4 lg:px-6">
    <div className="pb-4"><Button nativeButton={false} role="link" variant="outline" size="lg" render={<Link to={backTo} />}><ArrowLeft />{backLabel}</Button></div>
    {children}
  </div></BaseLayout>
}
