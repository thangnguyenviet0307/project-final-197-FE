import axios from "axios"
import { ZodError } from "zod"
import type { ApiError } from "@/types/auth"

// Older Backend builds may still return localized errors. Keep the UI in English.
function englishMessage(message: string | undefined, status: number): string {
  if (message && !/[\u0102-\u01b0\u1ea0-\u1ef9\u0110\u0111]/.test(message)) return message
  switch (status) {
    case 400: return "Invalid input. Please check your details."
    case 401: return "Invalid credentials or expired session. Please sign in again."
    case 403: return "You do not have permission to perform this action."
    case 404: return "The requested resource was not found."
    case 409: return "This change conflicts with existing data. Please check and try again."
    case 429: return "Too many requests. Please wait and try again."
    default: return status >= 500 ? "The server encountered an error. Please try again." : "Unable to connect to the server. Please try again."
  }
}

export function getApiError(error: unknown): ApiError {
  if (error instanceof ZodError) {
    return { statusCode: 0, message: "The server returned invalid data. Please contact your administrator." }
  }
  if (axios.isAxiosError<ApiError>(error)) {
    const statusCode = error.response?.status ?? 0
    return {
      statusCode,
      message: englishMessage(error.response?.data?.message, statusCode),
      errors: error.response?.data?.errors?.map((issue) => ({ ...issue, message: englishMessage(issue.message, 400) })),
    }
  }
  return { statusCode: 0, message: error instanceof Error ? englishMessage(error.message, 0) : "Something went wrong. Please try again." }
}
