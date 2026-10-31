import { z } from "zod"
const url = z.string().max(2048).url().refine(value => /^https?:\/\//i.test(value), "Chỉ chấp nhận URL HTTP(S)").nullable()
export const articleInputSchema = z.object({
  title: z.string().trim().min(3).max(200), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(255).optional(),
  type: z.enum(["news", "blog"]), category: z.string().trim().max(80), categoryId: z.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
  excerpt: z.string().trim().min(1).max(1000), content: z.string().trim().min(1).max(100000),
  authorName: z.string().trim().min(1).max(120), imageUrl: url,
  tags: z.array(z.string().trim().min(1).max(40)).max(20), status: z.enum(["draft", "scheduled", "published", "archived"]),
  publishAt: z.string().datetime({ offset: true }).nullable(), isFeatured: z.boolean(), sortOrder: z.number().int().min(0).max(10000),
  seo: z.object({ title: z.string().trim().max(70), description: z.string().trim().max(160) }),
}).superRefine((value, ctx) => {
  if (!value.categoryId && !value.category) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Chọn danh mục bài viết" })
  if (value.status === "published" && value.publishAt && Date.parse(value.publishAt) > Date.now()) ctx.addIssue({ code: "custom", path: ["publishAt"], message: "Dùng trạng thái Lên lịch cho thời điểm trong tương lai" })
  if (value.status === "scheduled" && !value.publishAt) ctx.addIssue({ code: "custom", path: ["publishAt"], message: "Chọn thời gian xuất bản" })
})
export type ArticleInput = z.infer<typeof articleInputSchema>
export const categoryInputSchema = z.object({ name: z.string().trim().min(1).max(80), slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(500), isActive: z.boolean() })
