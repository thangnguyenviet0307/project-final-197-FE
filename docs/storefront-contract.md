# Chuẩn bị storefront — chưa triển khai

Tài liệu này là danh sách quyết định cần chốt cho giai đoạn Frontend bán hàng. Các API bên dưới mô tả khả năng hiện có, không phải endpoint công khai dành cho người mua.

## Hợp đồng hiện tại

| Khu vực | Backend hiện tại | Giới hạn cho storefront |
| --- | --- | --- |
| Đăng nhập | `/auth/register`, `/auth/login`, `/auth/me`, refresh/logout | Đã có tài khoản role customer; đăng ký → đăng nhập → homepage. Khách không có quyền quản trị |
| Customers | CRUD `/customers`, phân trang/search | Hồ sơ liên hệ, không chứa thông tin xác thực hoặc quan hệ với session người mua |
| Catalog | `/products`, `/categories`, `/brands` | Yêu cầu xác thực và quyền nội bộ; không gọi bằng tài khoản admin nhúng trong Frontend |
| Tạo đơn | `POST /orders` với `customerId`, địa chỉ, paymentType, product/variant ID và quantity | Chỉ admin có quyền tạo; chưa có checkout dành cho khách |
| Đọc đơn | `/orders`, `/orders/:id` | Scope theo quyền nhân viên, chưa phải quyền sở hữu đơn của người mua |

## Các quyết định cần chốt

1. Có cho khách vãng lai đặt hàng hay bắt buộc đăng nhập? Customer contact và buyer identity liên kết theo ID, không tự liên kết chỉ vì email trùng.
2. Catalog công khai chỉ trả sản phẩm/biến thể hoạt động, giá bán và tồn kho phù hợp; không cung cấp dữ liệu nội bộ. Backend phải áp dụng điều kiện này.
3. Giỏ hàng lưu ID sản phẩm/biến thể và số lượng. Giá/tồn kho được kiểm tra lại khi checkout; tổng tiền hiển thị ở client chỉ là ước tính.
4. Backend tính giá, giảm giá và tổng tiền; tạo đơn/trừ tồn kho nguyên tử; có cơ chế chống tạo trùng khi request bị timeout và khách thử lại.
5. Backend lấy buyer/customer ID từ session hoặc luồng guest đã xác minh, không tin `customerId` tùy ý do client gửi.
6. Endpoint lịch sử/chi tiết đơn phải kiểm tra quyền sở hữu. Không dùng guard Frontend để thay thế kiểm tra này.
7. Chốt phương thức thanh toán ban đầu, địa chỉ giao hàng, phí vận chuyển và trạng thái đơn mà khách được xem/hủy.

## Thứ tự triển khai khi bắt đầu

Catalog khách và chi tiết sản phẩm → giỏ hàng → checkout/tạo đơn → xác thực/tài khoản khách và lịch sử đơn theo chính sách đã chốt. Nếu checkout yêu cầu đăng nhập, triển khai xác thực trước checkout.

Trang đặt tại `src/pages/storefront`, layout tại `src/layout/storefront`; nghiệp vụ mới nằm trong `src/features`. Chỉ tái sử dụng service/hook quản trị sau khi kiểm tra quyền, response và side effect điều hướng.
