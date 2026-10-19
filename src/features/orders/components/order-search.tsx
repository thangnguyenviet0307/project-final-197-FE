import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function OrderSearch({ initial, onSearch }: { initial: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(initial)
  return <form className="flex flex-wrap items-end gap-2" role="search" onSubmit={event => { event.preventDefault(); onSearch(value.trim()) }}>
    <label className="grid w-full gap-2 text-sm sm:w-72">Order code or customer phone<Input type="search" placeholder="ORD-A7K9M2 or 0901234567" maxLength={100} value={value} onChange={event => setValue(event.target.value)} /></label>
    <Button type="submit" variant="outline"><Search className="size-4" />Search</Button>
    <Button type="button" variant="ghost" onClick={() => { setValue(""); onSearch("") }}>Clear search</Button>
  </form>
}
