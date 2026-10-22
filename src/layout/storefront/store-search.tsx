import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function StoreSearch() {
  const [keyword, setKeyword] = useState("")
  const navigate = useNavigate()

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const value = keyword.trim()
    if (!value) return

    navigate(`/shop?search=${encodeURIComponent(value)}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="flex w-full overflow-hidden rounded-full border border-gray-200 bg-white"
    >
      <input
        type="search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="Tìm kiếm sản phẩm, thương hiệu..."
        aria-label="Tìm kiếm sản phẩm"
        className="min-w-0 flex-1 px-5 py-3 text-sm text-gray-800 outline-none"
      />

      <button
        type="submit"
        aria-label="Tìm kiếm"
        className="flex w-16 items-center justify-center bg-gray-100 text-black transition hover:bg-green-500 hover:text-white"
      >
        <Search size={20} />
      </button>
    </form>
  )
}