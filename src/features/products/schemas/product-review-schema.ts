import { z } from "zod"

export const productReviewSchema = z.object({
  rating: z.number().int("Chọn số sao nguyên.").min(1, "Chọn từ 1 đến 5 sao.").max(5, "Chọn từ 1 đến 5 sao."),
  reviewerName: z.string().trim().min(1, "Vui lòng nhập tên người đánh giá.").max(100, "Tên tối đa 100 ký tự."),
  comment: z.string().trim().min(1, "Vui lòng nhập nội dung đánh giá.").max(2000, "Nội dung tối đa 2000 ký tự."),
  date: z.iso.datetime().optional(),
})
