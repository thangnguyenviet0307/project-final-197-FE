import { z } from 'zod';
import { changePasswordSchema } from './auth-schemas';

export const recoveryEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .check(z.email('Vui lòng nhập email hợp lệ.'))
    .toLowerCase(),
});
export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Nhập đủ 6 chữ số OTP.'),
});
export const recoveryPasswordSchema = z
  .object({
    newPassword: changePasswordSchema.shape.newPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Mật khẩu xác nhận không khớp.',
  });
