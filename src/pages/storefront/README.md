# Trang bán hàng

Các trang storefront hiện có:

- `home/index.tsx`: homepage theo thứ tự hero, danh mục nhanh, tiện ích, bộ sưu tập,
  tab ưu đãi/bán chạy/đánh giá, ba nhóm sản phẩm và testimonial.
- `products/index.tsx`: danh sách sản phẩm và bộ lọc.
- `products/detail.tsx`: chi tiết, gallery, chọn biến thể, tab nội dung và sản phẩm liên quan.

Các trang storefront được đăng ký trong router và dùng `src/layout/storefront/`.
Homepage và catalog dùng component/dữ liệu demo trong `src/features/storefront/`;
trang `/landing` là landing page riêng, còn `/shop` và `/shop/:slug` là storefront.
Xem [quy tắc tổ chức Frontend](../../../docs/frontend-structure.md).

Catalog storefront hiện dùng dữ liệu demo vì Backend chưa có API catalog công khai.
Đăng ký và đăng nhập khách hàng đang dùng API xác thực hiện có; trang tài khoản
yêu cầu session customer. Hồ sơ và đổi mật khẩu dùng API thật; đơn hàng và địa chỉ
vẫn là bản xem trước. Customers hiện là hồ sơ liên hệ, chưa được tự động liên kết
với tài khoản chỉ dựa trên email.

Giỏ hàng, checkout và luồng đặt hàng công khai chưa được bật. Xem
[hợp đồng storefront](../../../docs/storefront-contract.md) trước khi triển khai.
