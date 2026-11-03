import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ và tên.').max(100),
  email: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập email.')
    .pipe(z.email('Email không hợp lệ.').max(150)),
  subject: z.string().trim().min(1, 'Vui lòng nhập chủ đề.').max(150),
  message: z
    .string()
    .trim()
    .min(10, 'Lời nhắn phải có ít nhất 10 ký tự.')
    .max(2000),
});
