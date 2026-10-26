import { Skeleton } from "@/components/ui/skeleton"

/** Static storefront shell: safe before the router and auth session are ready. */
export function StoreSkeleton() {
  return <div role="status" aria-label="Đang tải trang bán hàng" aria-busy="true" className="min-h-svh bg-white text-gray-900">
    <span className="sr-only">Đang tải trang bán hàng</span>
    <div aria-hidden="true">
      <div className="border-b border-gray-100"><div className="mx-auto flex max-w-[1440px] justify-end gap-5 px-5 py-3"><Skeleton className="h-3 w-24 bg-gray-100" /><Skeleton className="h-3 w-20 bg-gray-100" /></div></div>
      <div className="mx-auto grid max-w-[1440px] items-center gap-6 px-5 py-6 md:grid-cols-[240px_minmax(0,1fr)_140px]">
        <div className="text-3xl font-black tracking-tight">DEMO<span className="text-[#55b000]">STORE</span></div>
        <Skeleton className="h-12 w-full rounded-full bg-gray-100" /><Skeleton className="hidden h-12 w-32 bg-gray-100 md:block" />
      </div>
      <div className="bg-[#55b000]"><div className="mx-auto flex max-w-[1440px] gap-8 px-5 py-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-5 w-24 bg-white/25" />)}</div></div>
      <div className="bg-[#f4f7f1]"><div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 lg:grid-cols-2">
        <div className="space-y-6"><Skeleton className="h-7 w-48 bg-gray-200" /><Skeleton className="h-12 w-4/5 bg-gray-200" /><Skeleton className="h-12 w-3/5 bg-gray-200" /><Skeleton className="h-5 w-full max-w-lg bg-gray-200" /><Skeleton className="h-12 w-40 bg-[#55b000]/20" /></div>
        <Skeleton className="h-72 w-full rounded-3xl bg-[#223328]/10 lg:h-96" />
      </div></div>
      <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-12 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center gap-4 rounded-xl border border-gray-200 p-6"><Skeleton className="size-12 shrink-0 rounded-full bg-gray-100" /><div className="flex-1 space-y-3"><Skeleton className="h-4 w-full bg-gray-100" /><Skeleton className="h-3 w-3/4 bg-gray-100" /></div></div>)}</div>
    </div>
  </div>
}
