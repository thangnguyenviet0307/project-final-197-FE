
import { api } from "@/services/api"

import type {
  ICustomer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "./type"

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

interface CustomersListResponse {
  success: boolean
  message?: string
  data: BackendCustomer[]
  pagination?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

// Chuyển dữ liệu Backend sang định dạng đang dùng trên FE
function mapCustomer(customer: BackendCustomer): ICustomer {
  return {
    _id: customer._id,
    first_name: customer.lastName,
    last_name: customer.firstName,
    email: customer.email,
    phone: customer.phone,
    birthday: null,
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
    ...(input.last_name !== undefined && {
      firstName: input.last_name,
    }),
    ...(input.first_name !== undefined && {
      lastName: input.first_name,
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
  getCustomers: async (): Promise<CustomerResponse<ICustomer[]>> => {
    const response = await api.get<CustomersListResponse>(
      "/customers",
      {
        params: {
          page: 1,
          limit: 100,
        },
      }
    )

    return {
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
