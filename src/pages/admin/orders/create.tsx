import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BaseLayout } from "@/layout/admin/base-layout"
import { api, getApiError } from "@/services/api"
import { customersService } from "@/features/customers/services/customers.service"
import { useProducts } from "@/features/products/hooks/use-products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/features/products/types/products"
import { useUnsavedForm } from "@/hooks/use-unsaved-form"

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const [customerSearch, setCustomerSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customerLabel, setCustomerLabel] = useState("")
  const [productPage, setProductPage] = useState(1)
  const [customerPage, setCustomerPage] = useState(1)
  const [items, setItems] = useState<{ productId: string; variantId?: string; quantity: number; label: string }[]>([])
  const [dirty, setDirty] = useState(false)
  const navigation = useUnsavedForm(dirty)
  const customers = useQuery({ queryKey: ["customers", "order-picker", customerSearch, customerPage], queryFn: ({ signal }) => customersService.getCustomers({ search: customerSearch, page: customerPage, limit: 20 }, signal) })
  const products = useProducts({ search: productSearch, page: productPage, limit: 20 })
  const mutation = useMutation({ mutationFn: async (input: { customerId: string; street: string; city: string; state: string; orderNote: string; paymentType: number; orderItems: { productId: string; variantId?: string; quantity: number }[] }) => {
    const { data } = await api.post<{ data: { _id: string } }>("/orders", input)
    return data.data
  }, meta: { successMessage: "Order created." }, onSuccess: async order => {
    navigation.allowSavedNavigation()
    await Promise.all([client.invalidateQueries({ queryKey: ["orders"] }), client.invalidateQueries({ queryKey: ["products"] })])
    navigate(`/auth/orders/${order._id}`)
  } })
  return <BaseLayout title="Create order"><form className="space-y-5 px-4 lg:px-6" onChange={() => setDirty(true)} onSubmit={event => {
    event.preventDefault()
    if (!items.length || !customerId) return
    const form = new FormData(event.currentTarget)
    mutation.mutate({ customerId, street: String(form.get("street")), city: String(form.get("city")), state: String(form.get("state")), orderNote: String(form.get("orderNote")), paymentType: 1, orderItems: items.map(({ productId, variantId, quantity }) => ({ productId, ...(variantId ? { variantId } : {}), quantity })) })
  }}>
    <Button nativeButton={false} variant="outline" render={<Link to="/auth/orders" />}>Back to orders</Button>
    <fieldset className="space-y-3 rounded-lg border p-4" disabled={mutation.isPending}><legend>Customer</legend>
      <Input aria-label="Search customers" placeholder="Search customers" value={customerSearch} onChange={event => { setCustomerSearch(event.target.value); setCustomerPage(1) }} />
      {customerId && <p>Selected customer: {customerLabel}</p>}
      {customers.isPending ? <p>Loading customers...</p> : customers.isError ? <p role="alert">{getApiError(customers.error).message}</p> : <>
        <div className="flex flex-wrap gap-2">{customers.data.data.map(customer => <Button type="button" key={customer._id} variant={customerId === customer._id ? "default" : "outline"} onClick={() => { setCustomerId(customer._id); setCustomerLabel(`${customer.first_name} ${customer.last_name}`); setDirty(true) }}>{customer.first_name} {customer.last_name} · {customer.phone}</Button>)}</div>
        <Button type="button" variant="outline" disabled={customerPage <= 1} onClick={() => setCustomerPage(page => page - 1)}>Previous customers</Button><Button type="button" variant="outline" disabled={customerPage >= customers.data.pagination.totalPages} onClick={() => setCustomerPage(page => page + 1)}>Next customers</Button>
      </>}
      <Link className="text-sm underline" to="/auth/customers">View registered customers</Link>
    </fieldset>
    <fieldset className="space-y-3 rounded-lg border p-4" disabled={mutation.isPending}><legend>Products</legend>
      <Input aria-label="Search products" placeholder="Search products" value={productSearch} onChange={event => { setProductSearch(event.target.value); setProductPage(1) }} />
      {products.isPending ? <p>Loading products...</p> : products.isError ? <p role="alert">{getApiError(products.error).message}</p> : <>
        <div className="space-y-3">{products.data?.data.filter(product => product.is_active).map(product => <div key={product._id}><p className="font-medium">{product.product_name}</p><div className="flex flex-wrap gap-2">{(product.variants?.length ? product.variants.map(variant => ({ variantId: variant._id, label: variant.sku, stock: variant.stock ?? 0, price: variant.price })) : [{ variantId: undefined, label: product.product_name, stock: product.stock ?? 0, price: product.price ?? 0 }]).map(item => <Button type="button" key={item.variantId ?? product._id} variant="outline" disabled={product.on_sale === false || item.stock <= 0} onClick={() => { setItems(previous => [...previous, { productId: product._id, ...(item.variantId ? { variantId: item.variantId } : {}), quantity: 1, label: `${product.product_name} · ${item.label}` }]); setDirty(true) }}>{product.on_sale === false || item.stock <= 0 ? "Tạm hết hàng" : `${item.label} · ${formatPrice(item.price)} · Stock: ${item.stock}`}</Button>)}</div></div>)}</div>
        <Button type="button" variant="outline" disabled={productPage <= 1} onClick={() => setProductPage(page => page - 1)}>Previous products</Button><Button type="button" variant="outline" disabled={productPage >= (products.data?.pagination.totalPages ?? 1)} onClick={() => setProductPage(page => page + 1)}>Next products</Button>
      </>}
      {items.map((item, index) => <div className="flex flex-wrap items-center gap-2" key={index}><span>{item.label}</span><Input className="w-24" aria-label={`Quantity ${index + 1}`} type="number" min={1} step={1} required value={item.quantity} onChange={event => setItems(previous => previous.map((line, i) => i === index ? { ...line, quantity: Number(event.target.value) } : line))} /><Button type="button" variant="outline" onClick={() => { setItems(previous => previous.filter((_, i) => i !== index)); setDirty(true) }}>Remove</Button></div>)}
      <p className="text-sm text-muted-foreground">Prices, discounts and stock availability are verified by the server when you create the order.</p>
    </fieldset>
    <fieldset className="grid gap-3 sm:grid-cols-3" disabled={mutation.isPending}>{["street", "city", "state"].map(name => <label className="grid gap-2 text-sm capitalize" key={name}>{name}<Input name={name} maxLength={255} required /></label>)}</fieldset>
    <label className="grid gap-2 text-sm">Order note<Input name="orderNote" maxLength={2000} disabled={mutation.isPending} /></label>
    <p>Payment: Cash on delivery</p>
    {mutation.isError && <p role="alert" className="text-destructive">{getApiError(mutation.error).message}</p>}
    <Button type="submit" disabled={mutation.isPending || !customerId || !items.length}>Create order</Button>
    {navigation.guard}
  </form></BaseLayout>
}
