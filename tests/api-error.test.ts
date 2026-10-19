import axios, { AxiosError, AxiosHeaders } from "axios"
import { expect, it } from "vitest"
import { getApiError } from "@/utils/api-error"

function apiError({
  status,
  message,
  url = "/users",
  code,
  errors,
}: {
  status?: number
  message?: string
  url?: string
  code?: string
  errors?: { field: string; message: string }[]
}) {
  const config = { headers: new AxiosHeaders(), url }
  const response = status === undefined ? undefined : {
    status,
    statusText: "",
    headers: new AxiosHeaders(),
    config,
    data: { message, errors },
  }
  return new AxiosError(message, code, config, undefined, response)
}

it("distinguishes incorrect or disabled sign-in from an expired authenticated session", () => {
  expect(getApiError(apiError({ status: 401, url: "/auth/login" })).message)
    .toBe("The email or password is incorrect, or this account is disabled.")
  expect(getApiError(apiError({ status: 401, message: "Unauthorized", url: "/auth/login" })).message)
    .toBe("The email or password is incorrect, or this account is disabled.")
  expect(getApiError(apiError({ status: 401, url: "/auth/me" })).message)
    .toBe("Your session has expired or is no longer valid. Please sign in again.")
})

it("translates known Vietnamese auth messages and preserves specific backend errors", () => {
  expect(getApiError(apiError({ status: 401, message: "Email hoặc mật khẩu không chính xác" })).message)
    .toBe("The email or password is incorrect, or this account is disabled.")
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
    message: "phone: Enter a valid phone number.",
    errors: [{ field: "phone", message: "Enter a valid phone number." }],
  })
})

it.each([
  [400, "The request contains invalid or incomplete information. Review the indicated fields and try again."],
  [403, "Your account does not have permission to perform this action."],
  [404, "The requested record or API endpoint could not be found."],
  [409, "This operation conflicts with the current data. Review the details and try again."],
  [413, "The selected file or request is too large. Choose a smaller file and try again."],
  [415, "This file type is not supported. Choose a supported file format and try again."],
  [429, "Too many requests were made. Wait a few minutes before trying again."],
  [503, "The API is temporarily unavailable. Check that the backend is running and try again."],
])("uses a status-specific fallback for HTTP %i", (status, message) => {
  expect(getApiError(apiError({ status })).message).toBe(message)
})

it("explains network, timeout, and canceled requests separately", () => {
  expect(getApiError(apiError({ code: "ERR_NETWORK" })).message)
    .toBe("Could not reach the API. Check that the backend is running and that your network connection is available.")
  expect(getApiError(apiError({ code: "ECONNABORTED" })).message)
    .toBe("The API took too long to respond. Check your connection and try again.")
  expect(getApiError(new axios.CanceledError("canceled")).message)
    .toBe("The request was canceled because the page or sign-in session changed. Retry the action if it did not complete.")
})
