import axios from "axios"
import { ZodError } from "zod"
import type { ApiError } from "@/types/auth"

const localizedMessages: Array<[RegExp, string]> = [
  [/^email hoặc mật khẩu không chính xác$/i, "The email or password is incorrect, or this account is disabled."],
  [/^token không được cung cấp$/i, "Your sign-in token is missing. Please sign in again."],
  [/^token không hợp lệ$/i, "Your sign-in token is invalid. Please sign in again."],
  [/^token đã hết hạn$/i, "Your sign-in token has expired. Please sign in again."],
  [/^phiên đăng nhập không còn hợp lệ$/i, "Your session is no longer valid. Please sign in again."],
  [/^refresh token không hợp lệ$/i, "Your refresh session is no longer valid. Please sign in again."],
  [/^refresh token là bắt buộc$/i, "The refresh session token is missing. Please sign in again."],
  [/^không có quyền truy cập$/i, "Your account does not have permission to perform this action."],
  [/^chưa xác thực$/i, "Your session could not be verified. Please sign in again."],
  [/^quá nhiều yêu cầu xác thực/i, "Too many sign-in attempts. Wait a few minutes before trying again."],
  [/^làm mới token thành công$/i, "The session was refreshed successfully."],
  [/^số lượng phải\s*>=\s*1$/i, "Quantity must be at least 1."],
  [/^đơn hàng phải có ít nhất 1 sản phẩm$/i, "An order must include at least one product."],
  [/^họ không được để trống$/i, "First name is required."],
  [/^tên không được để trống$/i, "Last name is required."],
  [/^số điện thoại không hợp lệ$/i, "Enter a valid phone number."],
  [/^sku phải có ít nhất 3 ký tự$/i, "SKU must contain at least 3 characters."],
  [/^sku tối đa 64 ký tự$/i, "SKU cannot exceed 64 characters."],
  [/^giá biến thể không được nhỏ hơn 0$/i, "Variant price cannot be less than 0."],
]

function isLocalized(message: string): boolean {
  return /[\u0102-\u01b0\u1ea0-\u1ef9\u0110\u0111]/.test(message)
}

function translateMessage(message: string): string {
  const translation = localizedMessages.find(([pattern]) => pattern.test(message))?.[1]
  return translation ?? message
}

function isLoginRequest(url: string | undefined): boolean {
  return Boolean(url && /(?:^|\/)auth\/login(?:[?#]|$)/i.test(url))
}

function statusMessage(status: number, loginRequest: boolean): string {
  switch (status) {
    case 400: return "The request contains invalid or incomplete information. Review the indicated fields and try again."
    case 401:
      return loginRequest
        ? "The email or password is incorrect, or this account is disabled."
        : "Your session has expired or is no longer valid. Please sign in again."
    case 403: return "Your account does not have permission to perform this action."
    case 404: return "The requested record or API endpoint could not be found."
    case 408: return "The server timed out while processing this request. Please try again."
    case 409: return "This operation conflicts with the current data. Review the details and try again."
    case 413: return "The selected file or request is too large. Choose a smaller file and try again."
    case 415: return "This file type is not supported. Choose a supported file format and try again."
    case 422: return "The request could not be processed because one or more values are invalid."
    case 429: return "Too many requests were made. Wait a few minutes before trying again."
    case 502:
    case 503: return "The API is temporarily unavailable. Check that the backend is running and try again."
    case 504: return "The API did not respond in time. Try again in a moment."
    default:
      if (status >= 500) return "The API encountered a server error. Please try again or contact your administrator."
      return "The API rejected the request. Review the details and try again."
  }
}

function transportMessage(error: unknown): string {
  if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === "ERR_CANCELED")) {
    return "The request was canceled because the page or sign-in session changed. Retry the action if it did not complete."
  }
  if (!axios.isAxiosError(error)) return ""
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return "The API took too long to respond. Check your connection and try again."
  }
  if (error.code === "ERR_NETWORK") {
    return "Could not reach the API. Check that the backend is running and that your network connection is available."
  }
  if (error.code === "ERR_BAD_RESPONSE") {
    return "The API returned a response the application could not read. Please try again or contact your administrator."
  }
  return ""
}

function translateIssueMessage(message: string): string {
  return isLocalized(message) ? translateMessage(message) : message
}

export function getApiError(error: unknown): ApiError {
  if (error instanceof ZodError) {
    return {
      statusCode: 0,
      message: "The API returned data that does not match the expected format. Please contact your administrator.",
    }
  }

  if (axios.isAxiosError<ApiError>(error)) {
    const statusCode = error.response?.status ?? 0
    const responseMessage = error.response?.data?.message
    const errors = error.response?.data?.errors?.map((issue) => ({
      ...issue,
      message: translateIssueMessage(issue.message),
    }))
    const genericResponseMessage = responseMessage !== undefined &&
      /^(validation failed|database validation failed|unauthorized|forbidden|not found|conflict|internal server error|bad request)$/i.test(responseMessage)
    const message = responseMessage
      ? genericResponseMessage
        ? errors?.length
          ? errors.map(({ field, message: issueMessage }) => `${field}: ${issueMessage}`).join("; ")
          : statusMessage(statusCode, isLoginRequest(error.config?.url))
        : translateIssueMessage(responseMessage)
      : statusCode
        ? statusMessage(statusCode, isLoginRequest(error.config?.url))
        : transportMessage(error) || "The request could not be completed. Check your connection and try again."

    return {
      statusCode,
      message,
      errors,
    }
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "Session changed":
        return { statusCode: 0, message: "The sign-in session changed while this request was running. Retry the action." }
      case "Invalid token response":
        return { statusCode: 0, message: "The API returned an invalid sign-in session. Please sign in again." }
      case "Your session has expired.":
        return { statusCode: 401, message: "Your session has expired. Please sign in again." }
      default:
        return { statusCode: 0, message: error.message }
    }
  }

  return { statusCode: 0, message: "An unexpected error occurred while processing the request." }
}
