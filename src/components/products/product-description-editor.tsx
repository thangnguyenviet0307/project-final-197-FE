import { useEffect, useRef } from "react"
import ReactQuill from "react-quill-new"
import { descriptionToHtml, sanitizeDescription } from "@/lib/product-description"
import "react-quill-new/dist/quill.snow.css"
import "./product-description.css"

const modules = { toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline", "strike"], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link"], ["clean"]] }
const formats = ["header", "bold", "italic", "underline", "strike", "list", "blockquote", "link"]
export function ProductDescriptionEditor({ value, onChange, onBlur, disabled, invalid }: {
  value: string; onChange: (html: string) => void; onBlur: () => void; disabled: boolean; invalid: boolean
}) {
  const editor = useRef<ReactQuill>(null)
  useEffect(() => {
    const root = editor.current?.getEditor().root
    if (!root) return
    root.id = "description"
    root.setAttribute("role", "textbox")
    root.setAttribute("aria-label", "Description")
    root.setAttribute("aria-multiline", "true")
    root.setAttribute("aria-invalid", String(invalid))
    root.setAttribute("aria-describedby", "description-hint description-error")
  }, [invalid])
  return <div className="product-description-editor min-w-0" aria-disabled={disabled}>
    <ReactQuill ref={editor} theme="snow" value={descriptionToHtml(value)} modules={modules} formats={formats} readOnly={disabled}
      onBlur={onBlur} onChange={(html, _delta, source, instance) => {
        if (source === "user") onChange(instance.getText().trim() ? sanitizeDescription(html) : "")
      }} />
    <p id="description-hint" className="mt-2 text-xs text-muted-foreground">{value.length}/2000 characters including formatting. Images are managed separately.</p>
  </div>
}
