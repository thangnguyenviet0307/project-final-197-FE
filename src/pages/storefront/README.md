# Trang bán hàng

Các trang storefront hiện có:

- `home/index.tsx`: homepage gồm hero, danh mục nhanh, bộ sưu tập, sản phẩm theo
  danh mục, hướng dẫn mua sắm và cẩm nang phụ kiện.
- `products/index.tsx`: danh sách sản phẩm và bộ lọc.
- `products/detail.tsx`: chi tiết, gallery, chọn biến thể, tab nội dung và sản phẩm liên quan.

Các trang storefront được đăng ký trong router và dùng `src/layout/storefront/`.
Homepage và catalog dùng component/dữ liệu demo trong `src/features/storefront/`;
trang `/landing` là landing page riêng, còn `/shop` và `/shop/:slug` là storefront.
Xem [quy tắc tổ chức Frontend](../../../docs/frontend-structure.md).

Catalog sản phẩm storefront hiện dùng dữ liệu hiển thị riêng; menu danh mục tải cây
danh mục công khai từ Backend. Đăng ký mới tạo tài khoản User và hồ sơ Customer
trong cùng transaction, liên kết bằng `Customer.accountId`. Hồ sơ xuất hiện trong
danh sách liên hệ quản trị; điện thoại/địa chỉ chưa cung cấp được để trống. Không tự
ghép hồ sơ cũ theo email hoặc chuyển dữ liệu đăng ký trước đó.

Đăng ký và đăng nhập khách hàng dùng API xác thực hiện có; trang tài khoản yêu cầu
session customer. Hồ sơ và đổi mật khẩu dùng API thật; đơn hàng và địa chỉ vẫn là
bản xem trước. Chưa triển khai giỏ hàng/checkout. Xem
[hợp đồng storefront](../../../docs/storefront-contract.md) trước khi triển khai.
