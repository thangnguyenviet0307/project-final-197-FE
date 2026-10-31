import { expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { AxiosError, AxiosHeaders } from "axios"
import { ArticleForm } from "@/features/articles/components/article-form"
import type { AdminArticle, PostCategory } from "@/features/articles/types/articles"
const categories: PostCategory[] = [{ _id: "b".repeat(24), name: "Cẩm nang", slug: "cam-nang", description: "", isActive: true, __v: 0 }]
const article: AdminArticle = { _id: "a".repeat(24), title: "Tiêu đề ban đầu", slug: "stable-slug", type: "news", category: "Cẩm nang", categoryId: categories[0]._id, excerpt: "Tóm tắt", content: "Nội dung", imageUrl: null, tags: [], authorName: "Biên tập", status: "draft", publishAt: null, publishedAt: null, isFeatured: false, sortOrder: 0, viewCount: 0, seo: {}, __v: 4 }
it("creates selected homepage news with category, order and safe preview", async () => {
  const save = vi.fn(async () => {})
  render(<ArticleForm categories={categories} pending={false} save={save} reload={vi.fn()} />)
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Bài viết mới" } })
  fireEvent.change(screen.getByLabelText("Danh mục"), { target: { value: categories[0]._id } })
  fireEvent.change(screen.getByLabelText("Tóm tắt"), { target: { value: "Tóm tắt mới" } })
  fireEvent.change(screen.getByLabelText("Nội dung"), { target: { value: "<script>alert(1)</script>" } })
  fireEvent.click(screen.getByLabelText(/Chọn hiển thị trên trang chủ/))
  fireEvent.change(screen.getByLabelText("Thứ tự trên trang chủ"), { target: { value: "2" } })
  fireEvent.click(screen.getByRole("button", { name: "Xem trước" }))
  expect(screen.getByLabelText("Xem trước bài viết").querySelector("script")).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "Lưu bài viết" }))
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ title: "Bài viết mới", categoryId: categories[0]._id, category: "Cẩm nang", status: "draft", isFeatured: true, sortOrder: 2 })))
})
it("submits changed fields only and preserves the slug", async () => {
  const save = vi.fn(async () => {})
  render(<ArticleForm article={article} categories={categories} pending={false} save={save} reload={vi.fn()} />)
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Tiêu đề sửa" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu bài viết" }))
  await waitFor(() => expect(save).toHaveBeenCalledWith({ title: "Tiêu đề sửa" }))
})
it("keeps a conflicting draft and requires explicit reload before saving again", async () => {
  const config = { headers: new AxiosHeaders() }
  const save = vi.fn().mockRejectedValue(new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { status: 409, statusText: "Conflict", headers: {}, config, data: { message: "Bài đã thay đổi", code: "VERSION_CONFLICT" } }))
  const reload = vi.fn(async () => {})
  render(<ArticleForm article={article} categories={categories} pending={false} save={save} reload={reload} />)
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Bản nháp còn nguyên" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu bài viết" }))
  await screen.findByRole("alert")
  expect((screen.getByLabelText("Tiêu đề") as HTMLInputElement).value).toBe("Bản nháp còn nguyên")
  expect((screen.getByRole("button", { name: "Lưu bài viết" }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole("button", { name: "Tải lại dữ liệu (bỏ thay đổi)" }))
  await waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
})
it("rejects scheduling in the past without sending a request", async () => {
  const save = vi.fn(async () => {})
  render(<ArticleForm article={article} categories={categories} pending={false} save={save} reload={vi.fn()} />)
  fireEvent.change(screen.getByLabelText("Trạng thái"), { target: { value: "scheduled" } })
  fireEvent.change(screen.getByLabelText("Thời gian xuất bản"), { target: { value: "2020-01-01T12:00" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu bài viết" }))
  expect(await screen.findByRole("alert")).toBeTruthy()
  expect(save).not.toHaveBeenCalled()
})
