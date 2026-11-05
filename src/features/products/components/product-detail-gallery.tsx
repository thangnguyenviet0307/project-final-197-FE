import { useState } from 'react';
import { ProductImage } from '@/features/products/components/product-image';
import type { Product } from '@/features/products/types/products';

export function ProductDetailGallery({ product }: { product: Product }) {
  const images = [
    ...new Set(
      [
        product.thumbnail,
        ...(product.images ?? []).map((image) => image.secure_url),
        ...(product.sourceImages ?? []),
        ...(product.variants ?? []).flatMap((variant) => [
          variant.image,
          ...(variant.images ?? []),
        ]),
      ].filter((url): url is string => !!url)
    ),
  ];
  const [selected, setSelected] = useState<string>();
  const active = selected && images.includes(selected) ? selected : images[0];

  return (
    <section aria-label="Hình ảnh sản phẩm" className="min-w-0 space-y-3">
      <div className="bg-muted/20 relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-xl border">
        <ProductImage
          src={active}
          alt={product.product_name}
          className="absolute inset-0 size-full object-contain object-center p-4"
        />
      </div>
      {images.length > 0 ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((url, index) => (
              <button
                key={url}
                type="button"
                aria-label={`Xem ảnh ${index + 1}`}
                aria-pressed={active === url}
                onClick={() => setSelected(url)}
                className={`focus-visible:outline-ring bg-muted/20 relative size-20 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 ${active === url ? 'border-primary' : 'border-transparent'}`}
              >
                <ProductImage
                  src={url}
                  alt=""
                  className="absolute inset-0 size-full object-contain object-center p-1"
                />
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            {images.length} ảnh · Chọn ảnh để xem chi tiết
          </p>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Chưa có hình ảnh sản phẩm.
        </p>
      )}
    </section>
  );
}
