import { z } from "zod"

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Vui lòng nhập tên.").max(50, "Tên không được vượt quá 50 ký tự."),
  lastName: z.string().trim().min(1, "Vui lòng nhập họ.").max(50, "Họ không được vượt quá 50 ký tự."),
  personalEmail: z.union([z.string().trim().email("Địa chỉ email cá nhân không hợp lệ.").toLowerCase(), z.literal("")], { error: "Nhập địa chỉ email cá nhân hợp lệ, hoặc để trống." }),
  phone: z.string().trim().max(30, "Số điện thoại không được vượt quá 30 ký tự."),
  location: z.string().trim().max(255, "Địa điểm không được vượt quá 255 ký tự."),
  bio: z.string().trim().max(1000, "Giới thiệu không được vượt quá 1000 ký tự."),
})

export type ProfileValues = z.infer<typeof profileSchema>
