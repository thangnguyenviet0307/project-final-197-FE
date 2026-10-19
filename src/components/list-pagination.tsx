import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { pageNumbers } from "@/utils/pagination"

export function ListPagination({ label, page, totalPages, disabled = false, onPageChange }: {
  label: string
  page: number
  totalPages: number
  disabled?: boolean
  onPageChange: (page: number) => void
}) {
  return <footer className="mt-5 flex justify-end text-sm">
    <nav aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-3 font-medium">Page {page} of {totalPages}</span>
      <Button variant="outline" size="icon" aria-label="First page" disabled={page <= 1 || disabled} onClick={() => onPageChange(1)}><ChevronsLeft className="size-4" /></Button>
      <Button variant="outline" size="icon" aria-label="Previous" disabled={page <= 1 || disabled} onClick={() => onPageChange(page - 1)}><ChevronLeft className="size-4" /></Button>
      {pageNumbers(page, totalPages).map(number => typeof number === "string" ? <span key={number} className="px-1 text-muted-foreground">...</span>
        : <Button key={number} variant={number === page ? "default" : "outline"} size="icon" aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined} disabled={disabled} onClick={() => onPageChange(number)}>{number}</Button>)}
      <Button variant="outline" size="icon" aria-label="Next" disabled={page >= totalPages || disabled} onClick={() => onPageChange(page + 1)}><ChevronRight className="size-4" /></Button>
      <Button variant="outline" size="icon" aria-label="Last page" disabled={page >= totalPages || disabled} onClick={() => onPageChange(totalPages)}><ChevronsRight className="size-4" /></Button>
    </nav>
  </footer>
}
