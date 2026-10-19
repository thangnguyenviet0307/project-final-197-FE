# Trang bán hàng

Đặt các trang cho khách hàng tại đây, ví dụ `home/index.tsx`, `products/index.tsx`, `products/detail.tsx`, `cart/index.tsx`, `checkout/index.tsx`.

Dùng nghiệp vụ từ `src/features/`, UI dùng chung từ `src/components/`, và layout bán hàng tại `src/layout/storefront/` khi triển khai. Đăng ký URL trong `src/router/routes.tsx`.

Thư mục này chưa có trang hoạt động. Xem [quy tắc tổ chức Frontend](../../../docs/frontend-structure.md).

Customers hiện là hồ sơ liên hệ để kiểm thử API, chưa phải tài khoản khách hàng đăng nhập. Chưa triển khai giỏ hàng/checkout hoặc mở quyền truy cập catalog công khai. Xem [hợp đồng cần chốt trước khi phát triển](../../../docs/storefront-contract.md).
