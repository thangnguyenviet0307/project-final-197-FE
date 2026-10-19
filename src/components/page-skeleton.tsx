import { Skeleton } from "@/components/ui/skeleton"

export function ContentSkeleton({ label = "Loading page", variant = "table" }: { label?: string; variant?: "table" | "form" | "profile" }) {
  return <div role="status" aria-label={label} aria-busy="true" className="w-full space-y-4 p-4">
    <span className="sr-only">{label}</span>
    <div aria-hidden="true" className="space-y-4">
      {variant === "table" ? <>
        <div className="grid grid-cols-4 gap-4 border-b pb-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-5 w-3/4" />)}</div>
        {Array.from({ length: 5 }, (_, index) => <div key={index} className="flex items-center gap-4 border-b pb-3 last:border-0"><Skeleton className="size-12 shrink-0" /><Skeleton className="h-5 flex-1" /><Skeleton className="hidden h-5 w-1/5 sm:block" /><Skeleton className="h-6 w-16" /></div>)}
      </> : <>
        {variant === "profile" && <div className="flex items-center gap-4"><Skeleton className="size-24 rounded-full" /><div className="flex-1 space-y-3"><Skeleton className="h-7 w-1/2" /><Skeleton className="h-5 w-2/3" /></div></div>}
        <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>)}</div>
        <Skeleton className="h-36 w-full" />
      </>}
    </div>
  </div>
}

export function PageSkeleton() {
  return <div className="flex min-h-svh bg-background text-foreground">
    <aside aria-hidden="true" className="hidden w-64 shrink-0 space-y-6 border-r p-6 lg:block">
      <Skeleton className="h-10 w-40" />{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-9 w-full" />)}
    </aside>
    <div className="min-w-0 flex-1">
      <div aria-hidden="true" className="flex h-14 items-center justify-between border-b px-6"><Skeleton className="h-8 w-44" /><Skeleton className="size-8 rounded-full" /></div>
      <div className="space-y-6 p-4 md:p-6">
        <div aria-hidden="true" className="space-y-3"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-2/3 max-w-96" /></div>
        <div aria-hidden="true" className="grid grid-cols-2 gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 w-full" />)}</div>
        <ContentSkeleton label="Loading page" />
      </div>
    </div>
  </div>
}
