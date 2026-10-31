import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

// Only a settled response for the current query may correct the URL.
export function useValidListPage(page: number, query: {
  isSuccess?: boolean
  isFetching: boolean
  isPlaceholderData?: boolean
  data?: { pagination: { totalPages: number } }
}) {
  const [, setParams] = useSearchParams()
  const totalPages = query.data?.pagination.totalPages
  const ready = query.isSuccess && !query.isFetching && !query.isPlaceholderData
  useEffect(() => {
    if (!ready || totalPages === undefined || page <= Math.max(1, totalPages)) return
    setParams(previous => {
      const next = new URLSearchParams(previous)
      next.set("page", String(Math.max(1, totalPages)))
      return next
    }, { replace: true })
  }, [page, totalPages, ready, setParams])
}
