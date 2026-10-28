import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import { HeroSlideForm } from "@/features/hero-slides/components/hero-slide-form"
vi.mock("@/features/categories/hooks/use-categories", () => ({ useCategories: () => ({ data: [], isPending: false, isError: false }) }))
it("can save text and disable an orphan without inventing a replacement category", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  render(<HeroSlideForm slide={{ _id: "a".repeat(24), __v: 0, category: null, title: "Orphan title", description: "", imageUrl: null, sortOrder: 0, isActive: true }} pending={false} save={save} reload={vi.fn()} />)
  fireEvent.change(screen.getByDisplayValue("Orphan title"), { target: { value: "Updated title" } })
  fireEvent.click(screen.getByRole("checkbox"))
  fireEvent.submit(screen.getByRole("button", { name: "L\u01b0u slide" }).closest("form")!)
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: "Updated title", isActive: false, category: "" })))
})
