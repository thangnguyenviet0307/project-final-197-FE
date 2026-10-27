# Storefront — phạm vi giao diện hiện tại

Homepage, danh sách sản phẩm và trang chi tiết đã có giao diện demo trong
`src/pages/storefront/`, dùng dữ liệu trình bày tại
`src/features/storefront/data/products.ts`. Các bộ lọc, chọn biến thể, gallery,
tab mô tả và đồng hồ Flash Sale hoạt động trên dữ liệu demo này; chúng chưa tạo
đơn hàng hoặc đọc catalog từ Backend.

Tài liệu này là danh sách quyết định cần chốt cho giai đoạn Frontend bán hàng. Các API bên dưới mô tả khả năng hiện có, không phải endpoint công khai dành cho người mua.

## Hợp đồng hiện tại

| Khu vực | Backend hiện tại | Giới hạn cho storefront |
| --- | --- | --- |
| Đăng nhập | `/auth/register`, `/auth/login`, `/auth/me`, refresh/logout | Đã có tài khoản role customer; đăng ký → đăng nhập → homepage. Khách không có quyền quản trị |
| Customers | CRUD `/customers`, phân trang/search | Hồ sơ liên hệ, không chứa thông tin xác thực hoặc quan hệ với session người mua |
| Catalog | `/products`, `/categories`, `/brands` | Yêu cầu xác thực và quyền nội bộ; không gọi bằng tài khoản admin nhúng trong Frontend |
| Tạo đơn | `POST /orders` với `customerId`, địa chỉ, paymentType, product/variant ID và quantity | Admin/staff có quyền tạo đơn nội bộ; chưa có checkout dành cho khách |
| Đọc đơn | `/orders`, `/orders/:id` | Scope theo quyền nhân viên, chưa phải quyền sở hữu đơn của người mua |

## Các quyết định cần chốt

1. Có cho khách vãng lai đặt hàng hay bắt buộc đăng nhập? Customer contact và buyer identity liên kết theo ID, không tự liên kết chỉ vì email trùng.
2. Catalog công khai chỉ trả sản phẩm/biến thể hoạt động, giá bán và tồn kho phù hợp; không cung cấp dữ liệu nội bộ. Backend phải áp dụng điều kiện này.
3. Giỏ hàng lưu ID sản phẩm/biến thể và số lượng. Giá/tồn kho được kiểm tra lại khi checkout; tổng tiền hiển thị ở client chỉ là ước tính.
4. Backend tính giá, giảm giá và tổng tiền; tạo đơn/trừ tồn kho nguyên tử; có cơ chế chống tạo trùng khi request bị timeout và khách thử lại.
5. Backend lấy buyer/customer ID từ session hoặc luồng guest đã xác minh, không tin `customerId` tùy ý do client gửi.
6. Endpoint lịch sử/chi tiết đơn phải kiểm tra quyền sở hữu. Không dùng guard Frontend để thay thế kiểm tra này.
7. Chốt phương thức thanh toán ban đầu, địa chỉ giao hàng, phí vận chuyển và trạng thái đơn mà khách được xem/hủy.

## Việc cần hoàn thiện trước khi mở bán

Catalog khách và chi tiết sản phẩm → giỏ hàng → checkout/tạo đơn → xác thực/tài khoản khách và lịch sử đơn theo chính sách đã chốt. Nếu checkout yêu cầu đăng nhập, triển khai xác thực trước checkout.

Trang đặt tại `src/pages/storefront`, layout tại `src/layout/storefront`; nghiệp vụ mới nằm trong `src/features`. Chỉ tái sử dụng service/hook quản trị sau khi kiểm tra quyền, response và side effect điều hướng.

## Account đã triển khai

`/account` yêu cầu `accountType=customer`. Hồ sơ dùng GET/PATCH `/customer-auth/me`, chỉ hiển thị họ, tên, ngày sinh, giới tính, email đăng nhập chỉ đọc và điện thoại. Địa chỉ giao hàng dùng PATCH `/customer-auth/shipping-address` (người nhận, email, tỉnh/thành, phường/xã, địa chỉ, thời gian giao thuận tiện; không điện thoại/CCCD). GET `/customer-auth/orders` phân trang và chỉ trả đơn có Customer ID của phiên đăng nhập, không nhận ID khách tùy ý. Đổi mật khẩu dùng POST `/customer-auth/change-password` và kết thúc phiên. Giỏ hàng/checkout chưa triển khai; lịch sử chỉ hiển thị đơn thật đã được tạo. Quy tắc đầy đủ: [PROJECT_RULES.md](../PROJECT_RULES.md).
