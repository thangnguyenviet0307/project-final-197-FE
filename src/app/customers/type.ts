
export interface ICustomer {
  _id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  birthday?: string | null
  street: string
  city: string
  state: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCustomerInput {
  first_name: string
  last_name: string
  phone: string
  email: string
  birthday?: string | null
  street: string
  city: string
  state: string
  password?: string | null
}

export type UpdateCustomerInput =
  Partial<CreateCustomerInput>
