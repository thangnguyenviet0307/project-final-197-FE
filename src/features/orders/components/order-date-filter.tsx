import { useState } from "react"
import { Button } from "@/components/ui/button"
import { validOrderDate } from "@/features/orders/utils/order-date"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarDays } from "lucide-react"

export function DatePicker({ label, value, onChange, before, after }: { label: string; value: string; onChange: (value: string) => void; before?: string; after?: string }) {
  const [open, setOpen] = useState(false)
  const parse = (date: string) => validOrderDate(date) ? new Date(`${date}T00:00:00`) : undefined
  return <div className="grid gap-2 text-sm"><span>{label}</span><Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger render={<Button type="button" variant="outline" className="min-w-44 justify-start font-normal" aria-label={label} />}><CalendarDays className="size-4" />{parse(value)?.toLocaleDateString("vi-VN") ?? "Pick a date"}</PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={parse(value)} defaultMonth={parse(value)} disabled={[...(before && parse(before) ? [{ before: parse(before)! }] : []), ...(after && parse(after) ? [{ after: parse(after)! }] : [])]} onSelect={date => {
      if (date) { onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`); setOpen(false) }
    }} /></PopoverContent>
  </Popover></div>
}
export function OrderDateFilter({ initialFrom, initialTo, onApply }: { initialFrom: string; initialTo: string; onApply: (from: string, to: string) => void }) {
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const invalid = Boolean((from && !validOrderDate(from)) || (to && !validOrderDate(to)) || (from && to && from > to))
  return <form className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); if (!invalid) onApply(from, to) }}>
    <DatePicker label="Order date from" value={from} onChange={setFrom} after={to} />
    <DatePicker label="Order date to" value={to} onChange={setTo} before={from} />
    <Button type="submit" variant="outline" disabled={invalid}>Apply dates</Button><Button type="button" variant="ghost" onClick={() => { setFrom(""); setTo(""); onApply("", "") }}>Clear dates</Button>
    {invalid && <p role="alert" className="text-sm text-destructive">Enter valid dates with the start on or before the end date.</p>}
  </form>
}
