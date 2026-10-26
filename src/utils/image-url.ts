import { z } from "zod"

export const imageUrlSchema = z.string({ error: "Vui lòng nhập đường dẫn ảnh." }).trim().max(255, "Đường dẫn ảnh không được vượt quá 255 ký tự.").refine(
  value => !value || (URL.canParse(value) && /^https?:\/\//i.test(value)),
  "Vui lòng nhập đường dẫn ảnh HTTP hoặc HTTPS hợp lệ.",
)
