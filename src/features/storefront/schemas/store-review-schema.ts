import { z } from "zod"
import { productReviewSchema } from "@/features/products/schemas/product-review-schema"

export const storeReviewSchema = productReviewSchema.omit({ date: true }).extend({
  email: z.string().trim().max(254, "Email tối đa 254 ký tự.").refine(value => !value || z.email().safeParse(value).success, "Email không hợp lệ."),
  phone: z.string().trim().max(20, "Số điện thoại tối đa 20 ký tự.").refine(value => !value || /^\+?[0-9 ()-]{7,20}$/.test(value), "Số điện thoại không hợp lệ."),
}).strict()
export type StoreReviewInput = z.infer<typeof storeReviewSchema>
