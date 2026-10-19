# Cải thiện phần quản trị

Phạm vi hiện tại là Frontend quản trị. Customers là hồ sơ liên hệ dùng để kiểm thử API, không phải tài khoản đăng nhập của người mua. Chưa triển khai storefront, đăng ký khách hàng, giỏ hàng hay checkout; không mở rộng quyền `customer` từ phía Frontend.

## Thay đổi đã thực hiện

- Nút Add của Categories, Brands và Users mở lần lượt `/categories/new`, `/brands/new`, `/users/new`, chỉ dành cho admin. Lưu thành công quay lại danh sách; trang thêm có nút quay lại và Cancel. Form sửa Categories/Brands dùng chung với form thêm để giữ validation nhất quán.
- Bỏ bộ chọn số dòng “per page” khỏi các trang, vẫn giữ phân trang. Categories/Brands/Users dùng 10 dòng; Products/Orders vẫn hiểu `limit` trong URL cũ.
- Categories lưu URL thumbnail trong `icon`, Brands trong `logoUrl`. Form có preview, nhận HTTP/HTTPS tối đa 255 ký tự; để trống để xóa ảnh. Bảng hiển thị ảnh API thay cho icon suy ra từ tên; ảnh thiếu hoặc tải lỗi có placeholder. Backend validation cũng được cập nhật để nhận/xóa trường ảnh. Cần chạy lại Backend từ source mới hoặc build lại nếu dùng `dist`.
- Customers ánh xạ `first_name ↔ firstName`, `last_name ↔ lastName` theo nhãn First Name/Last Name của form. Không sửa dữ liệu đã lưu trong database. Backend hiện có thông báo validation tiếng Việt gọi `firstName` là họ, nên cần thống nhất thuật ngữ trước khi nhập dữ liệu thật.
- Bỏ Birthday/Password khỏi form, kiểu dữ liệu và bảng Customers vì schema Backend không hỗ trợ. Form chỉ tạo hồ sơ liên hệ.
- Tìm kiếm Customers theo tên/email/điện thoại và phân trang được gửi đến server. URL chứa `page` và `search`; tổng số kết quả lấy từ `pagination.total`. Không còn giới hạn ngầm ở 100 khách hàng đầu tiên. Backend hiện chưa hỗ trợ tìm theo địa chỉ hoặc chuỗi họ tên ghép.
- Khi tạo tài khoản, mật khẩu mặc định là `Admin123` cho admin và `Staff123` cho staff. Reset mật khẩu dùng `crypto.getRandomValues` và giữ nguyên giá trị suốt thời gian dialog mở. Backend vẫn chịu trách nhiệm ép đổi mật khẩu, thu hồi session và giới hạn đăng nhập.
- Hai Dashboard hiển thị nhãn demo. Các số liệu này chưa được nối vào báo cáo kinh doanh thực tế.
- Dialog xóa Brand giữ nguyên khi API thất bại. Categories dùng Dialog chung, label liên kết control và khóa thao tác khi đang lưu. Staff chỉ thấy quyền đọc Categories theo cấu hình Backend hiện tại.
- Command Search có thêm Orders, Categories, Brands, Customers và lọc quyền quản trị như sidebar.
- Metadata gốc bỏ nhận diện, canonical và URL chia sẻ của template. Chỉ thêm canonical/ảnh chia sẻ khi đã có domain và thương hiệu chính thức.

## Kiểm tra

```powershell
pnpm.cmd build
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd test:contracts
```

`test:contracts` cần source Backend ở `../project-final-197-BE`; có thể chỉ định đường dẫn khác bằng `pnpm.cmd test:contracts <đường-dẫn-backend>`. Script đọc schema TypeScript hiện tại, kiểm tra payload do service Frontend tạo ra và một số trường response mapping. Script chỉ thực thi các module validation trong danh sách cho phép, không import app/model/config database, không gọi HTTP và không kết nối MongoDB. Đây là kiểm tra hợp đồng schema, không phải kiểm thử tích hợp Backend qua HTTP.

Test hồi quy gồm CRUD Customers/Brands/Categories, ánh xạ tên, phân trang sau bản ghi thứ 100, tìm kiếm trên server, retry, lỗi xóa do tham chiếu, cache Brands, quyền Categories, dialog Escape và mật khẩu tạm.

## Cần kiểm chứng trước khi vận hành

1. Chạy Backend trên database phát triển riêng, dùng tài khoản và dữ liệu thử nghiệm; kiểm tra API thật cho CRUD, quyền staff/admin, refresh và thu hồi session.
2. Trình duyệt desktop/mobile: bảng dài, cuộn ngang, dialog có nội dung dài, focus khi mở/đóng, Escape, trạng thái pending và dark mode. Test jsdom không chứng minh bố cục trực quan đạt yêu cầu.
3. Kiểm tra dữ liệu Customers cũ có bị đảo ý nghĩa tên hay không. Không tự động chuyển đổi vì chưa biết dữ liệu đó được tạo từ client nào.
4. Thay Dashboard demo bằng API thống kê; rà các trang Settings/Contact/Newsletter còn là template trước khi đưa vào vận hành.

## Công việc để sau

- Đồng bộ filter/page/sort của Users, Categories và Brands với URL; xác định các filter nào cần chạy toàn tập dữ liệu trên server.
- Tách service/hook cập nhật quyền Users và logic page Categories/Brands khi phát triển tiếp các module đó.
- Kiểm kê code template không reachable; chỉ loại bỏ khi không còn dùng làm tài liệu tham khảo.
- Làm theo [kế hoạch storefront](storefront-contract.md) khi bắt đầu Frontend bán hàng.

## Account creation defaults

New admin accounts use `Admin123`; new staff accounts use `Staff123`. Changing the role updates the displayed password. Password resets continue to generate random temporary passwords.
