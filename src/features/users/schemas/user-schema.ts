import { z } from "zod";
import { passwordSchema } from "@/features/auth/schemas/auth-schemas";

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1, "Vui lòng nhập tên.").max(50, "Tên không được vượt quá 50 ký tự."),
  lastName: z.string().trim().min(1, "Vui lòng nhập họ.").max(50, "Họ không được vượt quá 50 ký tự."),
  email: z.string().trim().check(z.email("Địa chỉ email không hợp lệ.")).toLowerCase(),
  password: passwordSchema,
  role: z.enum(["admin", "staff"], { error: "Chọn Quản trị viên hoặc Nhân viên." }),
});
