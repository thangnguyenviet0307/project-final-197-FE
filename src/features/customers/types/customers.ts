
export interface ICustomer {
  _id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  street: string
  city: string
  state: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export type CustomerStatus = "all" | "active" | "inactive"

export interface CreateCustomerInput {
  first_name: string
  last_name: string
  phone: string
  email: string
  street: string
  city: string
  state: string
}

export type UpdateCustomerInput =
  Partial<CreateCustomerInput>
