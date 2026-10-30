// Endpoints may omit metadata; stricter contracts extend this shared envelope.
export interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data: T
}

export interface ApiResult<T> extends ApiEnvelope<T> {
  success: boolean
}

export interface ApiResponse<T> extends ApiResult<T> {
  statusCode: number
  message: string
}

export interface ApiError {
  code?: string
  statusCode: number
  message: string
  errors?: { field: string; message: string; code?: string }[]
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
