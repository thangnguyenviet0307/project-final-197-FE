# Khôi phục phiên khi F5 trên bản deploy

FE: https://project-final-197-fe.vercel.app

BE: https://project-final-197-be.onrender.com

## Thay đổi

Production gọi `/api/v1` trên domain FE. Rewrite đầu tiên trong `vercel.json` chuyển tiếp tới `/api/v1` của BE; rewrite về `index.html` chỉ dành cho trang SPA. Trình duyệt nhận refresh cookie từ domain FE, thay vì phụ thuộc cookie bên thứ ba ở domain Render.

`VITE_API_BASE_URL` cũ trỏ trực tiếp Render không ghi đè đường dẫn production này. Biến đó vẫn dùng cho `pnpm.cmd dev` ở local. Không chuyển token sang localStorage và không nới kiểm tra refresh token của BE.

## Triển khai và kiểm tra

1. Deploy lại FE cùng các thay đổi `vercel.json`, `api.ts` và `api-base-url.ts`. Chỉ chạy build local chưa cập nhật website đang dùng.
2. BE vẫn chạy với `NODE_ENV=production`; `FRONTEND_ORIGINS` phải chứa chính xác `https://project-final-197-fe.vercel.app` (không có dấu `/` cuối). Giữ các origin hợp lệ khác nếu có, không dùng wildcard. Không cần đổi secrets hoặc dữ liệu DB.
3. Đăng nhập lại một lần sau deploy để tạo cookie trên domain FE. Cookie cũ của Render không được trình duyệt tự chuyển sang domain FE.
4. DevTools → Network: login và refresh phải đi qua `https://project-final-197-fe.vercel.app/api/v1/auth/...`, không gọi trực tiếp Render. Không chia sẻ giá trị Cookie, Set-Cookie hoặc Authorization.
5. DevTools → Application → Cookies: kiểm tra có `adminRefreshToken` thuộc domain FE, path `/api/v1/auth`, HttpOnly và Secure. Không cần xem hoặc sao chép giá trị.
6. F5 nhiều lần ở dashboard và trang quản lý: refresh trả 200, sau đó `/auth/me` trả 200, giữ nguyên trang đang xem. Thử thêm hai tab, hết hạn access token, logout và thu hồi phiên: phiên đã thu hồi vẫn phải bị từ chối.
7. Kiểm tra Customer đăng nhập/F5 riêng; cookie Customer có path `/api/v1/customer-auth`, không được khôi phục nhầm tài khoản Admin.

Các phản hồi auth qua proxy dùng `Cache-Control: private, no-store`. Nếu API trả HTML `index.html`, kiểm tra rewrite API đứng trước SPA fallback. Nếu có 403 `AUTH_ORIGIN_REJECTED`, kiểm tra allowlist FE ở BE; không tắt kiểm tra Origin.

Khi thay địa chỉ BE, cập nhật destination trong `vercel.json`. Khi dùng hosting khác Vercel (kể cả preview build local), hosting đó cũng phải chuyển tiếp `/api/v1` tới BE.

## Giới hạn kiểm chứng

Test local kiểm tra lựa chọn API production và hồi quy auth; không xác nhận trình duyệt đã lưu cookie trên bản deploy mới. Hoàn tất bước Network/Cookies/F5 sau khi deploy để kiểm chứng thực tế.
