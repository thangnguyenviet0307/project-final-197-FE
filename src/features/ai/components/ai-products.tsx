import { Link } from 'react-router-dom';
import type { AiProduct } from '../types/ai';
export function AiProducts({ products }: { products: AiProduct[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {products.map((p) => (
        <Link
          key={p.id}
          to={`/shop/${encodeURIComponent(p.slug)}`}
          className="rounded-xl border border-gray-200 bg-white p-3 text-gray-900 hover:border-green-600"
        >
          {p.thumbnail && /^https?:\/\//.test(p.thumbnail) && (
            <img
              src={p.thumbnail}
              alt=""
              loading="lazy"
              className="mb-2 h-24 w-full object-contain"
            />
          )}
          <strong className="block">{p.name}</strong>
          <span className="block text-xs text-gray-500">
            {p.brand} · {p.category}
          </span>
          <span className="block font-semibold text-green-700">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 2,
            }).format(p.price)}
          </span>
          <span className="text-xs">
            {p.available ? 'Còn hàng' : 'Hết hàng'}
          </span>
        </Link>
      ))}
    </div>
  );
}
