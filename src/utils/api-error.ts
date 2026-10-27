import axios from "axios"
import { ZodError } from "zod"
import type { ApiError } from "@/types/api"

const localizedMessages: Array<[RegExp, string]> = [
  [/^email hoặc mật khẩu không chính xác$/i, "Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị vô hiệu hóa."],
  [/^token không được cung cấp$/i, "Thiếu thông tin xác thực. Vui lòng đăng nhập lại."],
  [/^token không hợp lệ$/i, "Thông tin xác thực không hợp lệ. Vui lòng đăng nhập lại."],
  [/^token đã hết hạn$/i, "Thông tin xác thực đã hết hạn. Vui lòng đăng nhập lại."],
  [/^phiên đăng nhập không còn hợp lệ$/i, "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại."],
  [/^refresh token không hợp lệ$/i, "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại."],
  [/^refresh token là bắt buộc$/i, "Thiếu thông tin gia hạn phiên. Vui lòng đăng nhập lại."],
  [/^không có quyền truy cập$/i, "Tài khoản của bạn không có quyền thực hiện thao tác này."],
  [/^chưa xác thực$/i, "Không thể xác minh phiên đăng nhập. Vui lòng đăng nhập lại."],
  [/^quá nhiều yêu cầu xác thực/i, "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ vài phút rồi thử lại."],
  [/^làm mới token thành công$/i, "Đã gia hạn phiên đăng nhập thành công."],
  [/^số lượng phải\s*>=\s*1$/i, "Số lượng phải từ 1 trở lên."],
  [/^đơn hàng phải có ít nhất 1 sản phẩm$/i, "Đơn hàng phải có ít nhất một sản phẩm."],
  [/^họ không được để trống$/i, "Vui lòng nhập tên."],
  [/^tên không được để trống$/i, "Vui lòng nhập họ."],
  [/^số điện thoại không hợp lệ$/i, "Vui lòng nhập số điện thoại hợp lệ."],
  [/^sku phải có ít nhất 3 ký tự$/i, "Mã SKU phải có ít nhất 3 ký tự."],
  [/^sku tối đa 64 ký tự$/i, "Mã SKU không được vượt quá 64 ký tự."],
  [/^giá biến thể không được nhỏ hơn 0$/i, "Giá biến thể không được nhỏ hơn 0."],
]

function isLocalized(message: string): boolean {
  return /[\u0102-\u01b0\u1ea0-\u1ef9\u0110\u0111]/.test(message)
}

function translateMessage(message: string): string {
  const translation = localizedMessages.find(([pattern]) => pattern.test(message))?.[1]
  return translation ?? message
}

function isLoginRequest(url: string | undefined): boolean {
  return Boolean(url && /(?:^|\/)(?:customer-)?auth\/login(?:[?#]|$)/i.test(url))
}

function statusMessage(status: number, loginRequest: boolean): string {
  switch (status) {
    case 400: return "Thông tin không hợp lệ hoặc chưa đầy đủ. Hãy kiểm tra các trường được đánh dấu và thử lại."
    case 401:
      return loginRequest
        ? "Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị vô hiệu hóa."
        : "Phiên đăng nhập đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại."
    case 403: return "Tài khoản của bạn không có quyền thực hiện thao tác này."
    case 404: return "Không tìm thấy dữ liệu hoặc dịch vụ được yêu cầu."
    case 408: return "Máy chủ xử lý quá thời gian cho phép. Vui lòng thử lại."
    case 409: return "Thao tác xung đột với dữ liệu hiện tại. Hãy kiểm tra thông tin và thử lại."
    case 413: return "Tệp hoặc yêu cầu quá lớn. Hãy chọn tệp nhỏ hơn và thử lại."
    case 415: return "Loại tệp không được hỗ trợ. Hãy chọn định dạng phù hợp và thử lại."
    case 422: return "Không thể xử lý yêu cầu vì có giá trị không hợp lệ."
    case 429: return "Có quá nhiều yêu cầu. Vui lòng chờ vài phút rồi thử lại."
    case 502:
    case 503: return "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau."
    case 504: return "Dịch vụ phản hồi quá chậm. Vui lòng thử lại sau giây lát."
    default:
      if (status >= 500) return "Dịch vụ gặp lỗi máy chủ. Vui lòng thử lại hoặc liên hệ quản trị viên."
      return "Yêu cầu bị từ chối. Hãy kiểm tra thông tin và thử lại."
  }
}

function transportMessage(error: unknown): string {
  if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === "ERR_CANCELED")) {
    return "Yêu cầu đã bị hủy do trang hoặc phiên đăng nhập thay đổi. Hãy thử lại nếu thao tác chưa hoàn tất."
  }
  if (!axios.isAxiosError(error)) return ""
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return "Dịch vụ phản hồi quá chậm. Hãy kiểm tra kết nối và thử lại."
  }
  if (error.code === "ERR_NETWORK") {
    return "Không thể kết nối dịch vụ. Hãy kiểm tra kết nối mạng và thử lại."
  }
  if (error.code === "ERR_BAD_RESPONSE") {
    return "Ứng dụng không thể đọc phản hồi từ dịch vụ. Vui lòng thử lại hoặc liên hệ quản trị viên."
  }
  return ""
}

function translateIssueMessage(message: string): string {
  return isLocalized(message) ? translateMessage(message) : message
}

function validationLabel(field: string, url = ""): string {
  const path = field.replace(/^(body|query|params)\./, "").replace(/\[(\d+)\]/g, ".$1")
  const variant = /^variants\.(\d+)\.(.+)$/.exec(path)
  const key = (variant?.[2] ?? path).split(".").at(-1) ?? ""
  const labels: Record<string, string> = {
    product_name: "Tên sản phẩm", model_year: "Năm sản xuất", sku: "SKU", variant_name: "Tên biến thể",
    stock: "Tồn kho", price: "Giá", compare_at_price: "Giá so sánh", discount: "Giảm giá",
    category: "Danh mục", brand: "Thương hiệu", thumbnail: "Đường dẫn ảnh đại diện", description: "Mô tả",
    firstName: "Tên", lastName: "Họ", email: "Địa chỉ email", password: "Mật khẩu",
    currentPassword: "Mật khẩu hiện tại", newPassword: "Mật khẩu mới", confirmPassword: "Xác nhận mật khẩu",
    personalEmail: "Địa chỉ email cá nhân", phone: "Số điện thoại", location: "Địa điểm", bio: "Giới thiệu",
    parent: "Danh mục cha", icon: "Ảnh danh mục", logoUrl: "Ảnh thương hiệu", role: "Vai trò",
    expectedVersion: "Phiên bản sản phẩm", isActive: "Trạng thái", is_active: "Trạng thái", active: "Trạng thái",
  }
  let label = labels[key] ?? (key ? key.replace(/_/g, " ").replace(/^./, value => value.toUpperCase()) : "Trường này")
  if (key === "name") label = /brands/.test(url) ? "Tên thương hiệu" : /categories/.test(url) ? "Tên danh mục" : "Tên"
  if (variant) {
    if (/\.images\./.test(path)) label = "Đường dẫn ảnh"
    if (/\.options\./.test(path)) label = key === "name" ? "Tên tùy chọn" : "Giá trị tùy chọn"
    return `Biến thể ${Number(variant[1]) + 1}: ${label === "SKU" ? label : label.toLowerCase()}`
  }
  return label
}

function validationMessage(message: string, label: string): string {
  const limit = /^Too (small|big): expected (number|string|array) to (?:be|have) (?:>=|<=)([\d.e+-]+)/i.exec(message)
  if (limit) {
    const minimum = limit[1].toLowerCase() === "small"
    const kind = limit[2].toLowerCase()
    const bound = limit[3]
    if (kind === "number" && minimum && Number(bound) === 0) return `${label} không được âm.`
    if (kind === "string") return minimum ? `${label} phải có ít nhất ${bound} ký tự.` : `${label} không được vượt quá ${bound} ký tự.`
    if (kind === "array") return `${label} phải có ${minimum ? "ít nhất" : "không quá"} ${bound} phần tử.`
    return `${label} phải ${minimum ? "từ" : "không quá"} ${bound}.`
  }
  if (/^Invalid input: expected int\b/i.test(message)) return `${label} phải là số nguyên.`
  if (/^Invalid input: expected number\b/i.test(message)) return `Vui lòng nhập số hợp lệ cho ${label.toLowerCase()}.`
  if (/^Invalid option:/i.test(message)) return `Vui lòng chọn ${label.toLowerCase()} hợp lệ.`
  if (/^Invalid (input|type|string)(:|$)/i.test(message)) return `Vui lòng nhập giá trị hợp lệ cho ${label.toLowerCase()}.`
  return translateIssueMessage(message)
}

export function getApiError(error: unknown): ApiError {
  if (error instanceof ZodError) {
    return {
      statusCode: 0,
      message: "Dịch vụ trả về dữ liệu không đúng định dạng. Vui lòng liên hệ quản trị viên.",
    }
  }

  if (axios.isAxiosError<ApiError>(error)) {
    const statusCode = error.response?.status ?? 0
    const responseMessage = error.response?.data?.message
    if (statusCode === 429 && /^Too many authentication requests; retry later$/i.test(responseMessage ?? "")) {
      const seconds = Number(error.response?.headers["retry-after"])
      const wait = Number.isFinite(seconds) && seconds > 0
        ? seconds < 60 ? `${Math.ceil(seconds)} giây` : `${Math.ceil(seconds / 60)} phút`
        : null
      return {
        statusCode,
        message: wait
          ? `Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ${wait}.`
          : "Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng chờ vài phút rồi thử lại.",
      }
    }
    const errors = error.response?.data?.errors?.map((issue) => ({
      ...issue,
      message: validationMessage(issue.message, validationLabel(issue.field, error.config?.url)),
    }))
    const genericResponseMessage = responseMessage !== undefined &&
      /^(validation failed|database validation failed|unauthorized|forbidden|not found|conflict|internal server error|bad request)$/i.test(responseMessage)
    const message = responseMessage
      ? genericResponseMessage
        ? errors?.length
          ? errors.map(({ field, message: issueMessage }) => {
            const label = validationLabel(field, error.config?.url)
            return issueMessage.toLowerCase().startsWith(label.toLowerCase()) ? issueMessage : `${label}: ${issueMessage}`
          }).join("; ")
          : statusMessage(statusCode, isLoginRequest(error.config?.url))
        : translateIssueMessage(responseMessage)
      : statusCode
        ? statusMessage(statusCode, isLoginRequest(error.config?.url))
        : transportMessage(error) || "Không thể hoàn tất yêu cầu. Hãy kiểm tra kết nối và thử lại."

    return {
      statusCode,
      message,
      errors,
    }
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "Session changed":
        return { statusCode: 0, message: "Phiên đăng nhập thay đổi khi đang xử lý yêu cầu. Vui lòng thử lại thao tác." }
      case "Invalid token response":
        return { statusCode: 0, message: "Dịch vụ trả về phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại." }
      case "Your session has expired.":
        return { statusCode: 401, message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." }
      default:
        return { statusCode: 0, message: error.message }
    }
  }

  return { statusCode: 0, message: "Đã xảy ra lỗi khi xử lý yêu cầu." }
}
