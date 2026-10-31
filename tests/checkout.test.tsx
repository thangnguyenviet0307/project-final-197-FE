import { beforeEach, expect, it, vi } from "vitest"
import { cleanup, act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import CheckoutPage from "@/pages/storefront/checkout"
import { useCartStore } from "@/stores/cart.store"
import { useAuthStore } from "@/stores/auth.store"
import { createCheckout, getCheckoutLocations } from "@/features/checkout/services/checkout.service"
import type { Product } from "@/features/products/types/products"
import { discountedLineTotal } from "@/features/products/utils/product-price"
import { getStoreProduct } from "@/features/storefront/services/catalog.service"
import { getProfile } from "@/features/auth/services/auth.service"

vi.mock("@/features/checkout/services/checkout.service", () => ({ createCheckout: vi.fn(), getCheckoutLocations: vi.fn() }))
vi.mock("@/features/storefront/services/catalog.service", () => ({ getStoreProduct: vi.fn() }))
vi.mock("@/features/auth/services/auth.service", () => ({ getProfile: vi.fn() }))
const product: Product = { _id: "a".repeat(24), slug: "test", product_name: "Sản phẩm A", price: 100000, stock: 20, category: null, brand: null }
const other = { ...product, _id: "b".repeat(24), slug: "other", product_name: "Sản phẩm B" }
function savedProfile(): Awaited<ReturnType<typeof getProfile>> {
  return { ...useAuthStore.getState().user!, personalEmail: "", phone: useAuthStore.getState().user?.phone ?? "", location: "", bio: "", avatar: "", accountType: "customer" }
}
function seedCart() {
  useCartStore.setState({ items: [] })
  useCartStore.getState().addItem(product, "", 2)
  useCartStore.getState().addItem(other, "", 1)
  useCartStore.getState().setSelected(other._id, "", false)
}
beforeEach(() => {
  sessionStorage.clear()
  vi.clearAllMocks()
  useAuthStore.setState({ user: { id: "customer", name: "Nguyễn An", firstName: "An", lastName: "Nguyễn", email: "test@example.com", phone: "0901234567", accountType: "customer", mustChangePassword: false }, isAuthenticated: true, isLoading: false })
  vi.mocked(getProfile).mockImplementation(async () => savedProfile())
  seedCart()
  vi.mocked(getCheckoutLocations).mockResolvedValue([
    { code: 1, name: "Tỉnh A", districts: [{ code: 2, name: "Huyện B", wards: [{ code: 3, name: "Xã C" }] }, { code: 7, name: "Huyện G", wards: [{ code: 8, name: "Xã H" }] }] },
    { code: 4, name: "Tỉnh D", districts: [{ code: 5, name: "Huyện E", wards: [{ code: 6, name: "Xã F" }] }] },
  ])
})
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const invalidation = vi.spyOn(client, "invalidateQueries")
  render(<QueryClientProvider client={client}><MemoryRouter><CheckoutPage /></MemoryRouter></QueryClientProvider>)
  return invalidation
}
async function fillAddress() {
  await screen.findByRole("option", { name: "Tỉnh A" })
  fireEvent.change(screen.getByLabelText("Tỉnh/Thành phố"), { target: { value: "1" } })
  fireEvent.change(screen.getByLabelText("Phường/Xã"), { target: { value: "3" } })
  fireEvent.change(screen.getByLabelText("Địa chỉ nhà"), { target: { value: "12 Đường A" } })
}
it("validates recipient fields without sending invalid orders and resets dependent address selections", async () => {
  mount()
  await fillAddress()
  fireEvent.change(screen.getByLabelText("Tỉnh/Thành phố"), { target: { value: "4" } })
  expect(screen.queryByLabelText("Quận/Huyện")).toBeNull()
  expect((screen.getByLabelText("Phường/Xã") as HTMLSelectElement).value).toBe("")
  fireEvent.change(screen.getByLabelText("Số điện thoại người nhận"), { target: { value: "123" } })
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await screen.findByText("Vui lòng nhập số điện thoại Việt Nam hợp lệ.")
  expect(createCheckout).not.toHaveBeenCalled()
})

it("loads the latest saved profile and resolves the complete delivery address", async () => {
  vi.mocked(getProfile).mockResolvedValue({ ...savedProfile(), firstName: "Bình", phone: "0987654321", shippingAddress: {
    recipientName: "Nguyễn Bình", email: "test@example.com", province: " a ", district: "Huyện cũ", ward: "c", street: "99 Đường B", deliveryTime: "",
  } })
  mount()
  await waitFor(() => expect(screen.getByLabelText("Phường/Xã")).toHaveProperty("value", "3"))
  expect(screen.getByLabelText("Tên người nhận")).toHaveProperty("value", "Nguyễn Bình")
  expect(screen.getByLabelText("Số điện thoại người nhận")).toHaveProperty("value", "0987654321")
  expect(screen.getByLabelText("Địa chỉ nhà")).toHaveProperty("value", "99 Đường B")
})

it("selects wards across the province and derives the district for checkout", async () => {
  vi.mocked(createCheckout).mockResolvedValue({ _id: "order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 })
  mount()
  await fillAddress()
  fireEvent.change(screen.getByLabelText("Phường/Xã"), { target: { value: "8" } })
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await screen.findByText("Đặt hàng thành công")
  expect(vi.mocked(createCheckout).mock.calls[0][0]).toMatchObject({ provinceCode: 1, districtCode: 7, wardCode: 8 })
})

it("preserves edited checkout fields when the saved profile arrives later", async () => {
  let finish!: (user: Awaited<ReturnType<typeof getProfile>>) => void
  vi.mocked(getProfile).mockImplementation(() => new Promise(resolve => { finish = resolve }))
  mount()
  await fillAddress()
  fireEvent.change(screen.getByLabelText("Số điện thoại người nhận"), { target: { value: "0987654321" } })
  await act(async () => finish({ ...savedProfile(), phone: "0912345678", shippingAddress: {
    recipientName: "Khách", email: "test@example.com", province: "Tỉnh D", ward: "Xã F", street: "Khác", deliveryTime: "",
  } }))
  expect(screen.getByLabelText("Số điện thoại người nhận")).toHaveProperty("value", "0987654321")
  expect(screen.getByLabelText("Địa chỉ nhà")).toHaveProperty("value", "12 Đường A")
  expect(screen.getByLabelText("Phường/Xã")).toHaveProperty("value", "3")
})
it("submits selected lines only, shows server confirmation and retains unselected cart lines", async () => {
  vi.mocked(createCheckout).mockResolvedValue({ _id: "order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 })
  const invalidation = mount()
  await fillAddress()
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await screen.findByText("Đặt hàng thành công")
  expect(vi.mocked(createCheckout).mock.calls[0][0]).toMatchObject({ recipientName: "Nguyễn An", phone: "0901234567", provinceCode: 1, districtCode: 2, wardCode: 3, paymentMethod: "cod", items: [{ productId: product._id, quantity: 2, expectedUnitPrice: 100000 }] })
  expect(useCartStore.getState().items.map(item => item.productId)).toEqual([other._id])
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["orders"] })
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["products"] })
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["auth", "me"] })
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["customers"] })
})
it("retains form/cart on 409 and displays actionable server errors", async () => {
  const config = { headers: new AxiosHeaders() }
  vi.mocked(createCheckout).mockRejectedValue(new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { status: 409, statusText: "Conflict", headers: {}, config, data: { message: "Sản phẩm không đủ tồn kho. Vui lòng giảm số lượng." } }))
  mount()
  await fillAddress()
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await screen.findByText("Sản phẩm không đủ tồn kho. Vui lòng giảm số lượng.")
  expect((screen.getByLabelText("Địa chỉ nhà") as HTMLInputElement).value).toBe("12 Đường A")
  expect(useCartStore.getState().items).toHaveLength(2)
})
it("retries an uncertain result with the same request ID and prevents duplicate submissions", async () => {
  vi.mocked(createCheckout).mockRejectedValueOnce(new AxiosError("Network error", "ERR_NETWORK"))
    .mockResolvedValueOnce({ _id: "order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 })
  mount()
  await fillAddress()
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  const retry = await screen.findByRole("button", { name: "Thử lại" })
  fireEvent.click(retry)
  await screen.findByText("Đặt hàng thành công")
  const calls = vi.mocked(createCheckout).mock.calls
  expect(calls).toHaveLength(2)
  expect(calls[1][0]).toEqual(calls[0][0])
})
it("refreshes changed prices only after explicit review and submits the reviewed price", async () => {
  const config = { headers: new AxiosHeaders() }
  vi.mocked(createCheckout).mockRejectedValueOnce(new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { status: 409, statusText: "Conflict", headers: {}, config, data: { message: "Giá sản phẩm đã thay đổi." } }))
    .mockResolvedValueOnce({ _id: "order", orderCode: "ORD-ABC234", totalAmount: 240000, orderStatus: 1 })
  vi.mocked(getStoreProduct).mockResolvedValue({ ...product, price: 120000 })
  mount()
  await fillAddress()
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  const refresh = await screen.findByRole("button", { name: "Cập nhật giá và tồn kho để xem lại" })
  expect(getStoreProduct).not.toHaveBeenCalled()
  fireEvent.click(refresh)
  await waitFor(() => expect(useCartStore.getState().items[0].unitPrice).toBe(120000))
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await screen.findByText("Đặt hàng thành công")
  expect(vi.mocked(createCheckout).mock.calls[1][0].items[0].expectedUnitPrice).toBe(120000)
})
it("does not remove quantities added to the cart while the order is in flight", async () => {
  let finish!: (result: { _id: string; orderCode: string; totalAmount: number; orderStatus: number }) => void
  vi.mocked(createCheckout).mockImplementation(() => new Promise(resolve => { finish = resolve }))
  mount()
  await fillAddress()
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await waitFor(() => expect(createCheckout).toHaveBeenCalledTimes(1))
  act(() => { useCartStore.getState().addItem(product, "", 1) })
  fireEvent.click(screen.getByRole("button", { name: "Đang đặt hàng…" }))
  expect(createCheckout).toHaveBeenCalledTimes(1)
  await act(async () => finish({ _id: "order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 }))
  expect(useCartStore.getState().items.find(item => item.productId === product._id)?.quantity).toBe(1)
})

it("does not consume another account's cart when a previous account's checkout finishes late", async () => {
  let finish!: (result: { _id: string; orderCode: string; totalAmount: number; orderStatus: number }) => void
  vi.mocked(createCheckout).mockImplementation(() => new Promise(resolve => { finish = resolve }))
  mount()
  await fillAddress()
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await waitFor(() => expect(createCheckout).toHaveBeenCalledTimes(1))
  await act(async () => {
    useAuthStore.getState().setSession({ ...savedProfile(), id: "another-customer" }, { accessToken: "another-token" })
    useCartStore.setState({ items: [] })
    useCartStore.getState().addItem(product, "", 3)
  })
  await act(async () => finish({ _id: "order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 }))
  expect(useCartStore.getState().items[0]).toMatchObject({ productId: product._id, quantity: 3 })
  expect(screen.queryByText("Đặt hàng thành công")).toBeNull()
})
it("allows guests to order without login and shows their order code without an account-history link", async () => {
  useAuthStore.setState({ user: null, isAuthenticated: false })
  seedCart()
  vi.mocked(createCheckout).mockResolvedValue({ _id: "guest-order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 })
  mount()
  await fillAddress()
  expect((screen.getByRole("button", { name: "Thanh toán" }) as HTMLButtonElement).disabled).toBe(false)
  expect(screen.getByRole("link", { name: "đăng nhập" }).getAttribute("href")).toBe("/thanh-vien?act=login")
  fireEvent.change(screen.getByLabelText("Tên người nhận"), { target: { value: "Khách mua hàng" } })
  fireEvent.change(screen.getByLabelText("Số điện thoại người nhận"), { target: { value: "0901234567" } })
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await screen.findByText("Đặt hàng thành công")
  expect(createCheckout).toHaveBeenCalledWith(expect.objectContaining({ recipientName: "Khách mua hàng" }), true)
  expect(screen.queryByRole("link", { name: "Xem lịch sử đơn hàng" })).toBeNull()
  expect(screen.getByText("ORD-ABC234")).toBeTruthy()
  expect(getProfile).not.toHaveBeenCalled()
  expect(useCartStore.getState().items.map(item => item.productId)).toEqual([other._id])
  expect(discountedLineTotal(0.05, 10, 3)).toBe(0.14)
})

it("keeps guest details and reuses the same request after an uncertain result", async () => {
  useAuthStore.setState({ user: null, isAuthenticated: false })
  seedCart()
  vi.mocked(createCheckout).mockRejectedValueOnce(new AxiosError("Network error", "ERR_NETWORK"))
    .mockResolvedValueOnce({ _id: "guest-order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 })
  mount()
  await fillAddress()
  fireEvent.change(screen.getByLabelText("Tên người nhận"), { target: { value: "Khách" } })
  fireEvent.change(screen.getByLabelText("Số điện thoại người nhận"), { target: { value: "0901234567" } })
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  fireEvent.click(await screen.findByRole("button", { name: "Thử lại" }))
  await screen.findByText("Đặt hàng thành công")
  expect(vi.mocked(createCheckout).mock.calls[1]).toEqual(vi.mocked(createCheckout).mock.calls[0])
})

it("restores an uncertain request after page remount and retries with the original body even with no selection", async () => {
  vi.mocked(createCheckout).mockRejectedValueOnce(new AxiosError("Timeout", "ECONNABORTED"))
    .mockResolvedValueOnce({ _id: "order", orderCode: "ORD-ABC234", totalAmount: 200000, orderStatus: 1 })
  mount()
  await fillAddress()
  fireEvent.click(screen.getByRole("button", { name: "Thanh toán" }))
  await screen.findByRole("button", { name: "Thử lại" })
  const original = vi.mocked(createCheckout).mock.calls[0][0]
  cleanup()
  useCartStore.getState().clearSelection()
  mount()
  fireEvent.click(await screen.findByRole("button", { name: "Thử lại" }))
  await screen.findByText("Đặt hàng thành công")
  expect(vi.mocked(createCheckout).mock.calls[1][0]).toEqual(original)
  expect(sessionStorage.getItem("storefront-pending-checkout-v1:customer")).toBeNull()
})

it("blocks checkout for an unavailable variant without discarding the cart", async () => {
  useCartStore.getState().refreshProducts([], [product.slug!])
  mount()
  await fillAddress()
  expect((screen.getByRole("button", { name: "Thanh toán" }) as HTMLButtonElement).disabled).toBe(true)
  expect(createCheckout).not.toHaveBeenCalled()
  expect(useCartStore.getState().items).toHaveLength(2)
})
