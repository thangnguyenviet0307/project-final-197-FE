import { expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ProductDescriptionEditor } from "@/components/products/product-description-editor"
import { descriptionToHtml, sanitizeDescription } from "@/lib/product-description"

it("escapes legacy plain text and preserves its line breaks", () => {
  expect(descriptionToHtml("Case < 5 & cable\nSecond line")).toBe("<p>Case &lt; 5 &amp; cable<br>Second line</p>")
})
it("removes executable markup, embeds and unsafe links while retaining formatting", () => {
  const html = sanitizeDescription('<h2>Case</h2><p><strong>Bold</strong><a href="javascript:alert(1)">Unsafe</a><a href="https://example.com">Safe</a><img src="x" onerror="alert(1)"><script>alert(1)</script><iframe src="https://example.com"></iframe></p>')
  expect(html).toContain("<strong>Bold</strong>")
  expect(html).toContain('href="https://example.com"')
  expect(html).not.toMatch(/javascript:|onerror|<script|<iframe|<img/)
})
it("mounts the real Quill editor, loads existing text without dirtying the form, and emits rich HTML", async () => {
  const onChange = vi.fn()
  render(<ProductDescriptionEditor value="Legacy description" onChange={onChange} onBlur={vi.fn()} disabled={false} invalid={false} />)
  const editor = screen.getByRole("textbox", { name: "Description" })
  expect(editor.textContent).toContain("Legacy description")
  expect(onChange).not.toHaveBeenCalled()
  editor.innerHTML = "<p><strong>Formatted case</strong></p>"
  fireEvent.input(editor)
  await waitFor(() => expect(onChange).toHaveBeenCalled())
  expect(onChange.mock.calls.at(-1)?.[0]).toContain("<strong>")
})
it("renders readonly editor content and exposes validation accessibly", () => {
  render(<ProductDescriptionEditor value="<p><em>Case</em></p>" onChange={vi.fn()} onBlur={vi.fn()} disabled invalid />)
  const editor = screen.getByRole("textbox", { name: "Description" })
  expect(editor.getAttribute("contenteditable")).toBe("false")
  expect(editor.getAttribute("aria-invalid")).toBe("true")
  expect(editor.querySelector("em")?.textContent).toBe("Case")
})
