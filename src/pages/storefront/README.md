# Trang bán hàng

Các trang storefront hiện có:

- `home/index.tsx`: homepage gồm hero, danh mục nhanh, bộ sưu tập, sản phẩm theo
  danh mục, hướng dẫn mua sắm và cẩm nang phụ kiện.
- `products/index.tsx`: danh sách sản phẩm và bộ lọc.
- `products/detail.tsx`: chi tiết, gallery, chọn biến thể, tab nội dung và sản phẩm liên quan.

Các trang storefront được đăng ký trong router và dùng `src/layout/storefront/`.
Homepage và catalog dùng component trong `src/features/storefront/` và catalog API công khai;
trang `/landing` là landing page riêng, còn `/shop` và `/shop/:slug` là storefront.
Xem [quy tắc tổ chức Frontend](../../../docs/frontend-structure.md).

Catalog và menu danh mục tải dữ liệu công khai từ Backend. Đăng ký qua
`/customer-auth/register` chỉ tạo Customer, không tạo User hoặc ghép theo email.
Xem `docs/CUSTOMER_ACCOUNT_MIGRATION.md` cho lịch sử chuyển đổi dữ liệu.

Đăng ký và đăng nhập khách hàng dùng API xác thực hiện có; trang tài khoản yêu cầu
session customer. Hồ sơ dùng `/customer-auth/me`, địa chỉ giao hàng dùng
`/customer-auth/shipping-address`, lịch sử đơn hàng dùng `/customer-auth/orders`
với quyền sở hữu lấy từ phiên đăng nhập. Email hồ sơ là email đăng nhập chỉ đọc;
địa chỉ không thu thập lại số điện thoại hoặc CCCD/CMND. Chưa triển khai giỏ hàng/checkout. Xem
[hợp đồng storefront](../../../docs/storefront-contract.md) trước khi triển khai.
