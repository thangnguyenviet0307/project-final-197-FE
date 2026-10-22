import { InventoryEditor } from "@/features/products/components/inventory-editor"
import { Link, useParams } from "react-router-dom"
import { Pencil, ArrowLeft, ExternalLink } from "lucide-react"
import { BaseLayout } from "@/layout/admin/base-layout"
import { ProductQueryState } from "@/features/products/components/product-query-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/features/products/hooks/use-product"
import { useAuthStore } from "@/stores/auth.store"
import { catalogName, formatPrice } from "@/features/products/types/products"
import { ProductImage } from "@/features/products/components/product-image"
import { useProductListLocation } from "@/features/products/hooks/use-product-list-location"
import { descriptionToHtml } from "@/features/products/utils/product-description"
import "@/features/products/components/product-description.css"
import { ProductGallery } from "@/features/products/components/product-gallery"
import { storefrontProductUrl } from "@/utils/storefront-url"

export default function ProductDetailPage() {
  const { id = "" } = useParams()
  const query = useProduct(id)
  const admin = useAuthStore(state => state.user?.role === "admin")
  const product = query.data
  const categorySlug = product?.category && typeof product.category !== "string" ? product.category.slug : undefined
  const storefrontPath = product?.slug?.trim() && categorySlug?.trim() ? storefrontProductUrl(categorySlug, product.slug) : null
  const returnTo = useProductListLocation()
  return <BaseLayout title={product?.product_name ?? "Product detail"}><div className="space-y-6 px-4 lg:px-6">
    <div className="flex flex-wrap gap-2"><Button nativeButton={false} role="link" variant="outline" render={<Link to={returnTo} />}><ArrowLeft />Back</Button>
      {storefrontPath && <Button nativeButton={false} role="link" variant="outline" render={<Link to={storefrontPath} target="_blank" rel="noopener noreferrer" />}><ExternalLink />View on storefront</Button>}
      {admin && product && <Button nativeButton={false} role="link" render={<Link to={`/products/${id}/edit`} state={{ returnTo }} />}><Pencil />Edit</Button>}</div>
    {query.isError || !product ? <ProductQueryState invalid={!/^[a-f\d]{24}$/i.test(id)} error={query.error} retry={query.refetch} /> : <>
      <div className="grid gap-6 md:grid-cols-2"><div className="space-y-3"><ProductImage src={product.thumbnail} alt={product.product_name} className="h-80 w-full rounded-lg border" />
        <div className="flex flex-wrap gap-2">{product.images?.map(image => <ProductImage key={image.public_id} src={image.secure_url} alt={product.product_name} className="size-24 border" />)}</div></div>
        <dl className="grid grid-cols-2 content-start gap-3 text-sm">{[
          ["Category", catalogName(product.category)], ["Brand", catalogName(product.brand)],
          ["Price", product.price === undefined ? "—" : formatPrice(product.price)], ["Discount", product.discount === undefined ? "—" : `${product.discount}%`],
          ["Stock", product.stock], ["Model year", product.model_year], ["Slug", product.slug], ["Created", product.createdAt], ["Updated", product.updatedAt],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value ?? "—"}</dd></div>)}
          <div><dt className="text-muted-foreground">Status</dt><dd><Badge variant="secondary">{product.is_active ? "Active" : "Inactive"}</Badge></dd></div>
          <div className="col-span-2 min-w-0"><dt className="text-muted-foreground">Storefront link</dt><dd>{storefrontPath ? <Link className="break-all font-medium text-primary underline underline-offset-4" to={storefrontPath} target="_blank" rel="noopener noreferrer">{storefrontPath}</Link> : <span className="text-muted-foreground">Unavailable — product or category slug is missing.</span>}</dd></div></dl>
      </div>
      <InventoryEditor key={`${product._id}-${product.__v}`} product={product} />
      {admin && <ProductGallery product={product} />}
      {product.description && <section><h2 className="mb-2 text-lg font-semibold">Description</h2><div className="product-description-content" dangerouslySetInnerHTML={{ __html: descriptionToHtml(product.description) }} /></section>}
      <section className="space-y-4"><h2 className="text-lg font-semibold">Variants</h2>{!product.variants?.length && <p className="text-sm text-muted-foreground">No variants.</p>}
        {product.variants?.map(variant => <article key={variant._id ?? variant.sku} className="space-y-3 rounded-lg border p-4"><h3 className="font-medium">{variant.variant_name || variant.sku}</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">{[
            ["SKU", variant.sku], ["Price", formatPrice(variant.price)], ["Stock", variant.stock], ["Color", variant.color], ["Size", variant.size],
            ["Compare at price", variant.compare_at_price == null ? null : formatPrice(variant.compare_at_price)],
            ...Object.entries(variant.attributes ?? {}).map(([name, value]) => [name, value === null ? "null" : String(value)]),
          ].map(([label, value], index) => value != null && <div key={`${label}-${index}`} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
          <div className="flex flex-wrap gap-2">{[...new Set([variant.image, ...(variant.images ?? [])].filter((url): url is string => !!url))].map(url => <ProductImage key={url} src={url} alt={variant.variant_name || variant.sku} className="size-24 border" />)}</div>
        </article>)}
      </section>
    </>}
  </div></BaseLayout>
}
