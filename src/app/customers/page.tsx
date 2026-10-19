
"use client"

import { useMemo, useState } from "react"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { BaseLayout } from "@/components/layouts/base-layout"
import { customersService } from "./customers.service"
import { CustomerTable } from "./components/data-table"

import type {
  ICustomer,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "./type"

const CustomersPage = () => {
  const queryClient = useQueryClient()

  const [params, setParams] = useSearchParams()
  const [success, setSuccess] = useState("")
  const [actionError, setActionError] = useState("")

  const searchQuery = params.get("search") || ""

  // Tìm kiếm Customers
  const handleSearch = (value: string) => {
    const nextParams = new URLSearchParams(params)
    const search = value.trim()

    if (search) {
      nextParams.set("search", search)
    } else {
      nextParams.delete("search")
    }

    setParams(nextParams)
  }

  // GET - Lấy danh sách Customers
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersService.getCustomers(),
  })

  const customers = useMemo<ICustomer[]>(() => {
  const payload = data?.data
  return Array.isArray(payload) ? payload : []
}, [data])

  // Lọc theo họ tên, email, số điện thoại, địa chỉ
  const filteredCustomers = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    if (!keyword) return customers

    return customers.filter((customer) => {
      const fullName =
        `${customer.first_name} ${customer.last_name}`

      const reverseName =
        `${customer.last_name} ${customer.first_name}`

      return [
        fullName,
        reverseName,
        customer.email,
        customer.phone,
        customer.street,
        customer.city,
        customer.state,
      ].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    })
  }, [customers, searchQuery])

  // POST - Thêm Customer
  const createMutation = useMutation({
    mutationFn: (values: CreateCustomerInput) =>
      customersService.createCustomer(values),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      })
    },
  })

  // PUT - Cập nhật Customer
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: UpdateCustomerInput
    }) => customersService.updateCustomer(id, values),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      })
    },
  })

  // DELETE - Xóa Customer
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      customersService.deleteCustomer(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      })
    },
  })

  
const handleAddCustomer = async (
  values: CreateCustomerInput
) => {
  setSuccess("")
  setActionError("")

  try {
    await createMutation.mutateAsync(values)
    setSuccess("Thêm khách hàng thành công!")
  } catch (error: unknown) {
    setActionError("Không thể thêm khách hàng. Kiểm tra thông báo trong form.")
    throw error
  }
}

  
const handleEditCustomer = async (
  id: string,
  values: UpdateCustomerInput
) => {
  setSuccess("")
  setActionError("")

  try {
    await updateMutation.mutateAsync({ id, values })
    setSuccess("Cập nhật khách hàng thành công!")
  } catch (error: unknown) {
    setActionError("Không thể cập nhật khách hàng. Kiểm tra thông báo trong form.")
    throw error
  }
}

const handleDeleteCustomer = async (id: string) => {
  setSuccess("")
  setActionError("")

  try {
    await deleteMutation.mutateAsync(id)
    setSuccess("Xóa khách hàng thành công!")
  } catch (error: unknown) {
    setActionError("Không thể xóa khách hàng.")
    throw error
  }
}

  return (
    <BaseLayout
      title="Customers"
      description="Manage your customers and customer information"
    >
      <div className="flex flex-col gap-4">
        {/* Thống kê */}
        <div className="@container/main px-4 lg:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">
                Total Customers
              </p>
              <p className="mt-2 text-3xl font-bold">
                {customers.length}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">
                With Birthday
              </p>
              <p className="mt-2 text-3xl font-bold">
                {
                  customers.filter(
                    (customer) => Boolean(customer.birthday)
                  ).length
                }
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">
                Search Results
              </p>
              <p className="mt-2 text-3xl font-bold">
                {filteredCustomers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Danh sách */}
        <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
          {success && (
            <div
              role="status"
              className="mb-4 rounded-md border p-3 text-sm text-green-600"
            >
              {success}
            </div>
          )}

          {actionError && (
            <div
              role="alert"
              className="mb-4 rounded-md border p-3 text-sm text-red-500"
            >
              {actionError}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-md border p-6 text-sm text-muted-foreground">
              Loading customers...
            </div>
          ) : isError ? (
            <div className="rounded-md border p-6 text-sm text-red-500">
              {(error as Error)?.message ||
                "Failed to load customers"}
            </div>
          ) : (
            <CustomerTable
              customers={filteredCustomers}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              onDelete={handleDeleteCustomer}
              onEdit={handleEditCustomer}
              onAdd={handleAddCustomer}
            />
          )}
        </div>
      </div>
    </BaseLayout>
  )
}

export default CustomersPage
