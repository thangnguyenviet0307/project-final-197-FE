# Trang bán hàng

Đặt các trang cho khách hàng tại đây, ví dụ `home/index.tsx`, `products/index.tsx`, `products/detail.tsx`, `cart/index.tsx`, `checkout/index.tsx`.

Dùng nghiệp vụ từ `src/features/`, UI dùng chung từ `src/components/`, và layout bán hàng tại `src/layout/storefront/` khi triển khai. Đăng ký URL trong `src/router/routes.tsx`.

Hiện có homepage `/`, `/contact`, đăng ký `/register` và đăng nhập `/account/login`, dùng `layout/storefront/`. Đăng ký thành công chuyển sang đăng nhập; đăng nhập thành công về homepage. Trang `/landing` nằm trong `pages/public/landing/` và cũng dùng layout cửa hàng. Khu vực account yêu cầu tài khoản customer. Hồ sơ và đổi mật khẩu đã dùng API thật; đơn hàng và địa chỉ vẫn là bản xem trước. Thư mục không tự tạo URL; chỉ các trang được đăng ký trong router mới truy cập được. Xem [quy tắc tổ chức Frontend](../../../docs/frontend-structure.md).

Customers hiện là hồ sơ liên hệ để kiểm thử API, chưa phải tài khoản khách hàng đăng nhập. Chưa triển khai giỏ hàng/checkout hoặc mở quyền truy cập catalog công khai. Xem [hợp đồng cần chốt trước khi phát triển](../../../docs/storefront-contract.md).

Account profile and password pages now call the shared auth APIs and require a customer session. Orders/addresses remain previews. Read [PROJECT_RULES.md](../../../PROJECT_RULES.md) for current behavior and pnpm checks.
