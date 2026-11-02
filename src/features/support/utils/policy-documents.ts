import type { PolicyContent } from "@/features/support/types/support"

interface StoreInformationLink { label: string; path?: string }

export const companyInformationLinks: readonly StoreInformationLink[] = [
  { label: "Chính sách bảo mật", path: "/chinh-sach-bao-mat" },
  { label: "Giới thiệu" },
  { label: "Điều khoản sử dụng" },
]

export const customerSupportLinks: readonly Required<StoreInformationLink>[] = [
  { label: "Chính sách đổi trả", path: "/chinh-sach-doi-tra" },
  { label: "Chính sách giao hàng", path: "/chinh-sach-giao-hang" },
  { label: "Chính sách bảo hành", path: "/chinh-sach-bao-hanh" },
]

export const policyDocuments = [
  { key: "privacy", path: "/chinh-sach-bao-mat", title: "Chính sách bảo mật", description: "Thông tin về dữ liệu cá nhân, mục đích sử dụng và cách liên hệ khi cần hỗ trợ." },
  { key: "shipping", path: "/chinh-sach-giao-hang", title: "Chính sách giao hàng", description: "Thông tin vận chuyển, nhận hàng và xử lý các vấn đề trong quá trình giao hàng." },
  { key: "returns", path: "/chinh-sach-doi-tra", title: "Chính sách đổi trả", description: "Điều kiện tiếp nhận, quy trình đổi trả và phương án giải quyết sau mua hàng." },
] as const

// Suggestions are inserted only by an explicit editor action, never used as public fallback content.
export const policySuggestions: Partial<PolicyContent> = {
  privacy: `Thông tin được cung cấp
Khi đăng ký, đặt hàng hoặc gửi yêu cầu bảo hành, bạn có thể cung cấp họ tên, email, số điện thoại, địa chỉ nhận hàng, thông tin đơn hàng, nội dung phản ánh và hình ảnh sản phẩm.

Mục đích sử dụng
Thông tin được sử dụng để quản lý tài khoản, xác nhận và xử lý đơn hàng, giao hàng, tiếp nhận bảo hành và phản hồi yêu cầu hỗ trợ. Bạn không nên gửi mật khẩu, mã xác thực hoặc thông tin thanh toán trong nội dung và ảnh đính kèm.

Cookie và dữ liệu trên thiết bị
Website sử dụng cookie phục vụ phiên đăng nhập và bộ nhớ trình duyệt cho giỏ hàng, tùy chọn hiển thị và việc khôi phục thao tác đặt hàng. Việc xóa dữ liệu trình duyệt có thể làm mất giỏ hàng hoặc thông tin thao tác chưa hoàn tất.

Tiếp nhận và lưu trữ
Nhân sự có quyền truy cập sử dụng thông tin để xử lý nghiệp vụ. Dữ liệu phục vụ giao hàng và lưu trữ hình ảnh cần được xử lý qua các nhà cung cấp liên quan. Phạm vi chia sẻ, nhà cung cấp và thời hạn lưu trữ cần được cửa hàng xác nhận trong chính sách công bố.

Yêu cầu hỗ trợ
Bạn có thể cập nhật thông tin hồ sơ trong tài khoản. Với yêu cầu kiểm tra, sửa hoặc xử lý dữ liệu khác, vui lòng liên hệ theo kênh hỗ trợ được cửa hàng công bố.`,
  shipping: `Thông tin nhận hàng
Vui lòng kiểm tra tên người nhận, số điện thoại, địa chỉ và sản phẩm trước khi xác nhận đơn. Cửa hàng sử dụng thông tin nhận hàng được ghi nhận tại thời điểm đặt đơn.

Phí giao hàng và thanh toán
Website hiện áp dụng miễn phí vận chuyển tại bước đặt hàng và hỗ trợ thanh toán khi nhận hàng (COD). Tổng tiền được hiển thị để bạn kiểm tra trước khi gửi đơn.

Tiến độ giao hàng
Phạm vi phục vụ và thời gian dự kiến cần được cửa hàng xác nhận theo địa chỉ nhận hàng, tình trạng sản phẩm và đơn vị vận chuyển. Thời điểm gửi đơn không đồng nghĩa với xác nhận đã bàn giao cho đơn vị giao hàng.

Khi nhận hàng
Kiểm tra thông tin đơn và tình trạng bên ngoài của kiện hàng. Nếu phát hiện giao sai, thiếu hàng hoặc dấu hiệu hư hỏng, hãy lưu hình ảnh và mã đơn để liên hệ cửa hàng xác minh.

Theo dõi và hỗ trợ
Khách đăng nhập có thể xem trạng thái xử lý đơn trong tài khoản. Khách đặt không đăng nhập cần lưu mã đơn để liên hệ. Khi cần sửa thông tin nhận hàng hoặc có vấn đề giao nhận, hãy liên hệ cửa hàng để được kiểm tra khả năng xử lý.`,
  returns: `Trường hợp cần hỗ trợ
Nếu sản phẩm được giao sai, thiếu, có dấu hiệu hư hỏng hoặc không hoạt động như thông tin đã cung cấp, vui lòng giữ mã đơn và liên hệ cửa hàng để được xác minh.

Thông tin cần chuẩn bị
Cung cấp mã đơn, tên sản phẩm, biến thể, mô tả tình trạng và hình ảnh liên quan. Giữ sản phẩm, phụ kiện và bao bì hiện có để phục vụ kiểm tra; không gửi kèm thông tin đăng nhập hoặc dữ liệu nhạy cảm.

Điều kiện và thời hạn
Điều kiện, thời hạn tiếp nhận, yêu cầu về tình trạng sản phẩm và các trường hợp không áp dụng cần được cửa hàng xác nhận theo từng sản phẩm. Vui lòng xác nhận với cửa hàng trước khi tự gửi trả hàng.

Quy trình xử lý
Cửa hàng tiếp nhận thông tin, kiểm tra đơn hàng và tình trạng sản phẩm, sau đó thông báo phương án xử lý. Việc gửi phản ánh hoặc yêu cầu bảo hành chưa phải xác nhận chấp thuận đổi trả.

Đổi hàng, hoàn tiền và chi phí
Phương án đổi hàng hoặc hoàn tiền, cách thức thực hiện, thời gian xử lý và bên chịu phí vận chuyển cần được hai bên xác nhận sau khi kiểm tra. Không tự gửi hàng đến địa chỉ chưa được cửa hàng xác nhận.`,
}
