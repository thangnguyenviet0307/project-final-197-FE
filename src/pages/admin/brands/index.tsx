"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ContentSkeleton } from "@/components/page-skeleton"
import { Tags, CheckCircle2, CirclePause } from "lucide-react"
import { getApiError } from "@/services/api"


import { useMemo, useState } from "react"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { BaseLayout } from "@/layout/admin/base-layout"
import { brandsService } from "@/features/brands/services/brands.service"
import { BrandTable } from "@/features/brands/components/data-table"

import type {
  IBrand,
  UpdateBrandInput,
} from "@/features/brands/types/brands"

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
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["brands", "management"],
    queryFn: ({ signal }) => brandsService.getBrands(signal),
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
    } catch (error) {
      setActionError("Không thể xóa thương hiệu.")
      throw error
    }
  }

  const stats = [
    { label: "Total brands", value: brands.length, Icon: Tags, color: "text-muted-foreground" },
    { label: "Active brands", value: brands.filter(brand => brand.isActive).length, Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Inactive brands", value: brands.filter(brand => !brand.isActive).length, Icon: CirclePause, color: "text-amber-600 dark:text-amber-400" },
  ]
  return <BaseLayout title="Brands" description="Manage your brands and product manufacturers.">
    <div className="space-y-4 px-4 lg:px-6">
      <section aria-label="Brand statistics" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map(({ label, value, Icon, color }) => <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
            <Icon className={`size-4 shrink-0 ${color}`} />
          </CardHeader>
          <CardContent><div className={`text-2xl font-bold ${color}`}>{isLoading ? <Skeleton className="h-8 w-20" /> : isError ? "-" : value}</div><p className="mt-1 text-xs text-muted-foreground">All brands</p></CardContent>
        </Card>)}
      </section>
      {success && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
      {actionError && <p role="alert" className="text-sm text-destructive">{actionError}</p>}
      {isLoading ? <ContentSkeleton label="Loading brands" /> : isError ? <div role="alert" className="space-y-3"><p>{getApiError(error).message}</p><Button variant="outline" onClick={() => void refetch()}>Retry brands</Button></div> : <BrandTable brands={filteredBrands} searchQuery={searchQuery} onSearch={handleSearch} onDelete={handleDeleteBrand} onEdit={handleEditBrand} />}
    </div>
  </BaseLayout>
}

export default BrandsPage
