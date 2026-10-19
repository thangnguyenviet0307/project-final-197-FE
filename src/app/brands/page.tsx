
"use client"

import { useMemo, useState } from "react"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { BaseLayout } from "@/components/layouts/base-layout"
import { brandsService } from "./brands.service"
import { BrandTable } from "./components/data-table"
import axios from "axios"

import type {
  IBrand,
  CreateBrandInput,
  UpdateBrandInput,
} from "./type"

const BrandsPage = () => {
  const queryClient = useQueryClient()

  const [params, setParams] = useSearchParams()
  const [success, setSuccess] = useState("")
  const [actionError, setActionError] = useState("")

  const searchQuery = params.get("search") || ""

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

  // GET - Lấy danh sách Brands
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandsService.getBrands(),
  })

  // Chuẩn hóa danh sách nhận từ Backend
  const brands = useMemo<IBrand[]>(() => {
  const payload = data?.data
  return Array.isArray(payload) ? payload : []
}, [data])

  // Tìm kiếm trên danh sách Brands đã tải
  const filteredBrands = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    if (!keyword) {
      return brands
    }

    return brands.filter((brand) =>
      [brand.name, brand.slug, brand.description ?? ""]
        .some((value) => value.toLowerCase().includes(keyword))
    )
  }, [brands, searchQuery])

  // POST - Thêm thương hiệu
  const createMutation = useMutation({
    mutationFn: (values: CreateBrandInput) =>
      brandsService.createBrand(values),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brands"],
      })
    },
  })

  // PUT - Sửa thương hiệu
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: UpdateBrandInput
    }) => brandsService.updateById(id, values),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brands"],
      })
    },
  })

  // DELETE - Xóa mềm thương hiệu
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      brandsService.deleteById(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brands"],
      })
    },
  })

  
const handleAddBrand = async (values: CreateBrandInput) => {
  setSuccess("")
  setActionError("")

  try {
    await createMutation.mutateAsync(values)
    setSuccess("Thêm thương hiệu thành công!")
  } catch (error: unknown) {
    let message = "Không thể thêm thương hiệu. Vui lòng thử lại."

    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const serverMessage = String(
        error.response?.data?.message ?? ""
      )

      const duplicateError =
        status === 409 &&
        /duplicate|already exists|đã tồn tại|trùng|E11000/i.test(
          serverMessage
        )

      if (duplicateError) {
        message = `Thương hiệu "${values.name}" đã tồn tại. Vui lòng nhập tên khác.`
      } else if (status === 400) {
        message =
          serverMessage || "Thông tin thương hiệu không hợp lệ."
      } else if (!error.response) {
        message = "Không thể kết nối Backend. Vui lòng kiểm tra server."
      }
    }

    setActionError(message)
    throw error
  }
}


  const handleEditBrand = async (
    id: string,
    values: UpdateBrandInput
  ) => {
    setSuccess("")
    setActionError("")

    try {
      await updateMutation.mutateAsync({ id, values })
      setSuccess("Cập nhật thương hiệu thành công!")
    } catch (error) {
      setActionError("Không thể cập nhật thương hiệu.")
      throw error
    }
  }

  const handleDeleteBrand = async (id: string) => {
    setSuccess("")
    setActionError("")

    try {
      await deleteMutation.mutateAsync(id)
      setSuccess("Xóa thương hiệu thành công!")
    } catch {
      setActionError("Không thể xóa thương hiệu.")
    }
  }

  return (
    <BaseLayout
      title="Brands"
      description="Manage your brands and product manufacturers"
    >
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">
                Total Brands
              </p>
              <p className="mt-2 text-3xl font-bold">
                {brands.length}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">
                Active Brands
              </p>
              <p className="mt-2 text-3xl font-bold">
                {brands.filter((brand) => brand.isActive).length}
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">
                Inactive Brands
              </p>
              <p className="mt-2 text-3xl font-bold">
                {brands.filter((brand) => !brand.isActive).length}
              </p>
            </div>
          </div>
        </div>

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
              Loading brands...
            </div>
          ) : isError ? (
            <div className="rounded-md border p-6 text-sm text-red-500">
              {(error as Error)?.message ||
                "Failed to load brands"}
            </div>
          ) : (
            <BrandTable
              brands={filteredBrands}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              onDelete={handleDeleteBrand}
              onEdit={handleEditBrand}
              onAdd={handleAddBrand}
            />
          )}
        </div>
      </div>
    </BaseLayout>
  )
}

export default BrandsPage
