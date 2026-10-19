import { Button } from "@/components/ui/button"
import { getApiError } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
export function ProductQueryState({ invalid, error, retry }: { invalid?: boolean; error: unknown; retry: () => unknown }) {
  if (invalid) return <p role="alert">Invalid product ID.</p>
  if (error) {
    const failure = getApiError(error)
    return <div role="alert" className="space-y-3"><p>{failure.statusCode === 404 ? "Product not found. It may have been deleted." : failure.message}</p><Button variant="outline" onClick={() => { void retry() }}>Retry</Button></div>
  }
  return <div role="status" aria-label="Loading product" className="space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-8 w-1/2" /></div>
}
