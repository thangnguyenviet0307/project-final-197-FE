
import { api } from "@/services/api"

import type {
  ICustomer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/features/customers/types/customers"

interface BackendCustomer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
  }
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface CustomerResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface CustomerPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface CustomersListResponse {
  success: boolean
  message?: string
  data: BackendCustomer[]
  pagination: CustomerPagination
}

// Chuyển dữ liệu Backend sang định dạng đang dùng trên FE
function mapCustomer(customer: BackendCustomer): ICustomer {
  return {
    _id: customer._id,
    first_name: customer.firstName,
    last_name: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    street: customer.address?.street ?? "",
    city: customer.address?.city ?? "",
    state: customer.address?.state ?? "",
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  }
}

// Chuyển dữ liệu Form thành cấu trúc Backend yêu cầu
function toBackendCustomer(
  input: CreateCustomerInput | UpdateCustomerInput
) {
  return {
    ...(input.first_name !== undefined && {
      firstName: input.first_name,
    }),
    ...(input.last_name !== undefined && {
      lastName: input.last_name,
    }),
    ...(input.email !== undefined && {
      email: input.email,
    }),
    ...(input.phone !== undefined && {
      phone: input.phone,
    }),
    ...(
      input.street !== undefined ||
      input.city !== undefined ||
      input.state !== undefined
    ) && {
      address: {
        street: input.street ?? "",
        city: input.city ?? "",
        state: input.state ?? "",
      },
    },
  }
}

export const customersService = {
  // GET danh sách Customers
  getCustomers: async (params: { page: number; limit: number; search?: string }, signal?: AbortSignal): Promise<CustomerResponse<ICustomer[]> & { pagination: CustomerPagination }> => {
    const response = await api.get<CustomersListResponse>(
      "/customers",
      {
        params,
        signal,
      }
    )

    return {
      pagination: response.data.pagination,
      success: response.data.success,
      message: response.data.message,
      data: (response.data.data ?? []).map(mapCustomer),
    }
  },

  // GET Customer theo ID
  getCustomerById: async (
    id: string
  ): Promise<CustomerResponse<ICustomer>> => {
    const response = await api.get<
      CustomerResponse<BackendCustomer>
    >(`/customers/${encodeURIComponent(id)}`)

    return {
      ...response.data,
      data: mapCustomer(response.data.data),
    }
  },

  // POST tạo Customer
  createCustomer: async (
    input: CreateCustomerInput
  ): Promise<CustomerResponse<ICustomer>> => {
    const response = await api.post<
      CustomerResponse<BackendCustomer>
    >("/customers", toBackendCustomer(input))

    return {
      ...response.data,
      data: mapCustomer(response.data.data),
    }
  },

  // PUT cập nhật Customer
  updateCustomer: async (
    id: string,
    input: UpdateCustomerInput
  ): Promise<CustomerResponse<ICustomer>> => {
    const response = await api.put<
      CustomerResponse<BackendCustomer>
    >(
      `/customers/${encodeURIComponent(id)}`,
      toBackendCustomer(input)
    )

    return {
      ...response.data,
      data: mapCustomer(response.data.data),
    }
  },

  // DELETE Customer
  deleteCustomer: async (
    id: string
  ): Promise<CustomerResponse<null>> => {
    const response = await api.delete<
      CustomerResponse<null>
    >(`/customers/${encodeURIComponent(id)}`)

    return response.data
  },
}
