# Chính sách và bảo hành

## Sử dụng

1. Admin/Super Admin mở `/auth/policies`, nhập đủ năm mục theo chính sách thực tế của cửa hàng. `Lưu bản nháp` chỉ lưu nội dung quản trị; `Công bố chính sách` cập nhật bản khách hàng được đọc. Không có nội dung bảo hành mẫu được tự động công bố.
2. Khách đọc `/chinh-sach-bao-hanh` từ footer hoặc trang chi tiết sản phẩm. Khi chưa có bản công bố, trang thông báo đang cập nhật và dẫn đến liên hệ.
3. Khách đăng nhập vào `/account/warranty`, chọn một sản phẩm trong đơn của mình đã Hoàn tất, mô tả lỗi và gửi. Sau khi có xác nhận, mở chi tiết để bổ sung ảnh. Đơn khách vãng lai cần liên hệ cửa hàng bằng mã đơn đã lưu; không tự liên kết vào tài khoản.
4. Nhân viên mở `/auth/warranties`, chọn yêu cầu Chờ tiếp nhận và nhập phản hồi để tiếp nhận. Nhân viên chỉ xử lý yêu cầu mình phụ trách sau khi tiếp nhận; Admin/Super Admin xử lý được tất cả.
5. Khách đọc phản hồi và lịch sử trạng thái trong chi tiết yêu cầu. Việc gửi yêu cầu không xác nhận đủ điều kiện bảo hành; hệ thống không tự suy diễn thời hạn bảo hành từ mô tả sản phẩm.

## API

Các đường dẫn dưới đây có tiền tố `/api/v1/support`.

| Endpoint | Quyền | Mục đích |
| --- | --- | --- |
| `GET /policy` | Công khai | Bản chính sách đã công bố, hoặc `null` |
| `GET /admin/policy` | Admin/Super Admin | Bản đang soạn và phiên bản |
| `PUT /admin/policy` | Admin/Super Admin | `{ content, expectedVersion, publish }` |
| `GET /customer/eligible-orders` | Customer | Phân trang đơn Hoàn tất thuộc tài khoản |
| `GET /customer/requests` | Customer | Danh sách yêu cầu của tài khoản |
| `POST /customer/requests` | Customer | `{ requestId: UUID, orderId, itemIndex, description }` |
| `GET /customer/requests/:id` | Customer sở hữu | Chi tiết và lịch sử |
| `POST /customer/requests/:id/images` | Customer sở hữu | Multipart một trường `image` |
| `GET /admin/requests` | Admin/Super Admin/Staff | Danh sách yêu cầu |
| `GET /admin/requests/:id` | Admin/Super Admin/Staff | Chi tiết, liên hệ khách và lịch sử |
| `PATCH /admin/requests/:id` | Theo người phụ trách | `{ expectedVersion, status, note }` |

Danh sách nhận `page`, `limit` (tối đa 50) và `status` tùy chọn. Trạng thái: `submitted → reviewing → repairing/resolved/rejected`; `repairing → resolved/rejected`. Hai trạng thái cuối không được mở lại. Mỗi lần chuyển bắt buộc có phản hồi hiển thị cho khách, cập nhật phiên bản và lịch sử trong cùng một thao tác MongoDB. Yêu cầu không thay đổi đơn hàng, thanh toán hoặc tồn kho.

## Ảnh và triển khai

- Dùng cấu hình Cloudinary sẵn có của Backend: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Không đặt khóa vào FE. Không thêm phụ thuộc mới.
- Ảnh được upload dạng `authenticated`, giới hạn năm ảnh/yêu cầu, 5 MB/ảnh, JPG/PNG/WebP và kiểm tra chữ ký file. Backend cấp URL tải có chữ ký hết hạn sau một giờ sau khi kiểm tra quyền. Tải lại chi tiết để nhận URL mới; không gửi URL cho người không liên quan.
- Chỉ bổ sung ảnh khi còn Chờ tiếp nhận. Ảnh có cùng nội dung byte được nhận diện để việc thử lại không tạo bản trùng. Nếu ghi liên kết ảnh thất bại, Backend dọn asset; tác vụ dọn ảnh riêng thất bại được đưa vào hàng đợi hỗ trợ `authenticated`.
- Tạo mới hai collection `store_policies` và `warranty_requests`. Khởi động Backend tạo index riêng của các collection mới; không migrate hoặc sửa dữ liệu lịch sử. Không chạy seed hay thao tác production trong quá trình triển khai tính năng này.
- Giữ nguyên `requestId` và nội dung khi gửi lại yêu cầu sau lỗi mạng. FE giữ dữ liệu trong bộ nhớ và chặn rời trang khi còn bản nháp; đóng cưỡng bức hoặc tải lại trang sẽ mất bản nháp và dữ liệu thử lại. Kiểm tra danh sách trước khi tạo lại nếu đã đóng trang giữa lúc gửi.
- Lỗi xung đột phiên bản giữ bản nháp và khóa lưu. Sao chép nội dung nếu cần, chọn Tải bản mới và kiểm tra trước khi lưu lại. Dữ liệu tải nền không nâng phiên bản của bản nháp.
- Giới hạn gửi/upload là 20 lượt mỗi IP mỗi 15 phút mỗi API process. Chạy nhiều API instance cần giới hạn chung tại gateway theo hạ tầng thực tế.

## Kiểm tra nghiệm thu với môi trường thật

Kiểm thử tự động dùng mock, không xác nhận kết nối MongoDB hoặc delivery Cloudinary thực tế. Trước khi phát hành, kiểm tra hai tài khoản khách độc lập, Staff/Admin, đơn Hoàn tất, gửi/upload lại sau mất kết nối, hai nhân viên cùng tiếp nhận, chỉnh chính sách ở hai tab, ảnh riêng/hết hạn, và refresh trực tiếp bốn đường dẫn FE trên hosting. Chưa triển khai thông báo email, bảo hành cho đơn khách vãng lai trực tuyến, hoặc tự tính hạn bảo hành.
