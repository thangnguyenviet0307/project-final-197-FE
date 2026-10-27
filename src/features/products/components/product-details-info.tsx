import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/features/products/components/product-image"
import { formatPrice, type Product } from "@/features/products/types/products"

export function ProductDetailsInfo({ product }: { product: Product }) {
  const dimensions = product.dimensions
  return <section className="space-y-4 rounded-lg border p-4">
    <h2 className="text-lg font-semibold">Thông tin bán hàng và vận chuyển</h2>
    <div className="flex flex-wrap gap-2">{[
      ["On sale", product.on_sale ?? true], ["Best Seller", product.is_best_seller], ["New", product.is_new], ["Hot", product.is_hot], ["Home", product.is_home],
    ].map(([label, enabled]) => <Badge key={String(label)} variant={enabled ? "default" : "secondary"}>{label}: {enabled ? "✓" : "✕"}</Badge>)}</div>
    <p className="text-sm">Lượt xem: {product.count_view ?? 0}</p>
    <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">{[
      ["SKU sản phẩm", product.sku], ["Mã vạch", product.barcode], ["Đơn vị tiền tệ", product.currency ?? "VND"],
      ["Khối lượng", product.weight == null ? null : `${product.weight} kg`],
      ["Kích thước (rộng × cao × sâu)", dimensions ? `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} cm` : null],
      ["Số lượng đặt tối thiểu", product.minimumOrderQuantity ?? 1],
      ["Thông tin bảo hành", product.warrantyInformation], ["Thông tin giao hàng", product.shippingInformation], ["Chính sách đổi trả", product.returnPolicy],
    ].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words font-medium">{value === "" || value == null ? "Chưa có thông tin" : value}</dd></div>)}</dl>
    <div className="flex flex-wrap gap-2"><span className="text-sm text-muted-foreground">Nhãn:</span>{product.tags?.length ? product.tags.map((tag, index) => <Badge key={`${tag}-${index}`} variant="secondary">{tag}</Badge>) : <span className="text-sm">Chưa có nhãn</span>}</div>
    {product.source && <div className="space-y-3 border-t pt-4"><h3 className="font-medium">Nguồn nhập sản phẩm</h3>
      <p className="text-sm">Lượt xem: {product.count_view ?? 0}</p>
    <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{[
        ["Nguồn", product.source], ["Mã sản phẩm nguồn", product.external_id], ["Tiền tệ nguồn", product.sourceCurrency],
        ["Tỷ giá nhập (VND/USD)", product.importExchangeRate == null ? null : formatPrice(product.importExchangeRate)],
        ["Ngày tạo tại nguồn", product.sourceCreatedAt], ["Ngày cập nhật tại nguồn", product.sourceUpdatedAt],
      ].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value ?? "Chưa có thông tin"}</dd></div>)}</dl>
      {!!product.sourceImages?.length && <div><p className="mb-2 text-sm text-muted-foreground">Ảnh từ nguồn nhập</p><div className="flex flex-wrap gap-2">{product.sourceImages.map((url, index) => <ProductImage key={`${url}-${index}`} src={url} alt={`${product.product_name} — ảnh nguồn ${index + 1}`} className="size-24 rounded border" />)}</div></div>}
    </div>}
  </section>
}
