import axios, { AxiosError, AxiosHeaders } from "axios"
import { expect, it } from "vitest"
import { getApiError } from "@/utils/api-error"

function apiError({
  status,
  message,
  url = "/users",
  code,
  errors,
  retryAfter,
}: {
  status?: number
  message?: string
  url?: string
  code?: string
  errors?: { field: string; message: string }[]
  retryAfter?: string
}) {
  const config = { headers: new AxiosHeaders(), url }
  const response = status === undefined ? undefined : {
    status,
    statusText: "",
    headers: new AxiosHeaders(retryAfter ? { "retry-after": retryAfter } : {}),
    config,
    data: { message, errors },
  }
  return new AxiosError(message, code, config, undefined, response)
}

it.each([
  ["900", "15 phút"], ["35", "35 giây"],
])("explains authentication throttling and Retry-After %s in Vietnamese", (retryAfter, wait) => {
  const failure = getApiError(apiError({ status: 429, message: "Too many authentication requests; retry later", url: "/auth/login", retryAfter }))
  expect(failure.statusCode).toBe(429)
  expect(failure.message).toBe(`Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ${wait}.`)
})

it("does not invent a wait duration when the rate-limit header is absent or invalid", () => {
  for (const retryAfter of [undefined, "invalid", "-3"]) {
    expect(getApiError(apiError({ status: 429, message: "Too many authentication requests; retry later", retryAfter })).message)
      .toBe("Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng chờ vài phút rồi thử lại.")
  }
})

it("distinguishes incorrect or disabled sign-in from an expired authenticated session", () => {
  expect(getApiError(apiError({ status: 401, url: "/auth/login" })).message)
    .toBe("Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị vô hiệu hóa.")
  expect(getApiError(apiError({ status: 401, message: "Unauthorized", url: "/auth/login" })).message)
    .toBe("Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị vô hiệu hóa.")
  expect(getApiError(apiError({ status: 401, url: "/auth/me" })).message)
    .toBe("Phiên đăng nhập đã hết hạn hoặc không còn hợp lệ. Vui lòng đăng nhập lại.")
})

it("translates known Vietnamese auth messages and preserves specific backend errors", () => {
  expect(getApiError(apiError({ status: 401, message: "Email hoặc mật khẩu không chính xác" })).message)
    .toBe("Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị vô hiệu hóa.")
  expect(getApiError(apiError({ status: 409, message: "Cannot delete a user referenced by orders" })).message)
    .toBe("Cannot delete a user referenced by orders")
  expect(getApiError(apiError({ status: 400, message: "Mã đơn hàng do máy chủ trả về" })).message)
    .toBe("Mã đơn hàng do máy chủ trả về")
})

it("shows localized validation details instead of the generic validation title", () => {
  expect(getApiError(apiError({
    status: 400,
    message: "Validation failed",
    errors: [{ field: "phone", message: "Số điện thoại không hợp lệ" }],
  }))).toMatchObject({
    message: "Số điện thoại: Vui lòng nhập số điện thoại hợp lệ.",
    errors: [{ field: "phone", message: "Vui lòng nhập số điện thoại hợp lệ." }],
  })
})

it.each([
  [400, "Thông tin không hợp lệ hoặc chưa đầy đủ. Hãy kiểm tra các trường được đánh dấu và thử lại."],
  [403, "Tài khoản của bạn không có quyền thực hiện thao tác này."],
  [404, "Không tìm thấy dữ liệu hoặc dịch vụ được yêu cầu."],
  [409, "Thao tác xung đột với dữ liệu hiện tại. Hãy kiểm tra thông tin và thử lại."],
  [413, "Tệp hoặc yêu cầu quá lớn. Hãy chọn tệp nhỏ hơn và thử lại."],
  [415, "Loại tệp không được hỗ trợ. Hãy chọn định dạng phù hợp và thử lại."],
  [429, "Có quá nhiều yêu cầu. Vui lòng chờ vài phút rồi thử lại."],
  [503, "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau."],
])("uses a status-specific fallback for HTTP %i", (status, message) => {
  expect(getApiError(apiError({ status })).message).toBe(message)
})

it("explains network, timeout, and canceled requests separately", () => {
  expect(getApiError(apiError({ code: "ERR_NETWORK" })).message)
    .toBe("Không thể kết nối dịch vụ. Hãy kiểm tra kết nối mạng và thử lại.")
  expect(getApiError(apiError({ code: "ECONNABORTED" })).message)
    .toBe("Dịch vụ phản hồi quá chậm. Hãy kiểm tra kết nối và thử lại.")
  expect(getApiError(new axios.CanceledError("canceled")).message)
    .toBe("Yêu cầu đã bị hủy do trang hoặc phiên đăng nhập thay đổi. Hãy thử lại nếu thao tác chưa hoàn tất.")
})

it.each([
  ["body.variants.0.stock", "Too small: expected number to be >=0", "Biến thể 1: tồn kho không được âm."],
  ["body.variants[1].price", "Too small: expected number to be >=0", "Biến thể 2: giá không được âm."],
  ["body.variants.0.stock", "Invalid input: expected int, received number", "Biến thể 1: tồn kho phải là số nguyên."],
  ["body.discount", "Too big: expected number to be <=70", "Giảm giá phải không quá 70."],
  ["body.firstName", "Too big: expected string to have <=50 characters", "Tên không được vượt quá 50 ký tự."],
])("formats a backend validation error for %s without exposing schema wording", (field, raw, message) => {
  const failure = getApiError(apiError({ status: 400, message: "Validation failed", errors: [{ field, message: raw }] }))
  expect(failure.errors).toEqual([{ field, message }])
  expect(failure.message).toBe(message)
})
