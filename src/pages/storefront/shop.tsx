import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, ArrowRight } from "lucide-react";
import { categories, products } from "@/features/storefront/catalog";
import ProductCard from "@/features/storefront/product-card";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const query = params.get("q")?.trim().toLocaleLowerCase("vi") ?? "";
  const brand = params.get("brand") ?? "";
  const sort = params.get("sort") ?? "featured";
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  const filtered = products
    .filter(
      (p) =>
        (!category || p.category === category) &&
        (!query ||
          `${p.name} ${p.brand} ${p.category}`
            .toLocaleLowerCase("vi")
            .includes(query)) &&
        (!brand || p.brand === brand) &&
        (!params.has("sale") || p.price < p.originalPrice),
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : sort === "rating"
            ? b.rating - a.rating
            : 0,
    );
  return (
    <div className="sf-container sf-page">
      <div className="sf-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>Sản phẩm
      </div>
      <div className="sf-page-intro">
        <span className="sf-kicker">KHÁM PHÁ THẾ GIỚI CÔNG NGHỆ</span>
        <h1>
          {category ||
            (params.has("sale") ? "Ưu đãi dành cho bạn" : "Tất cả sản phẩm")}
        </h1>
        <p>Thiết bị yêu thích. Trải nghiệm xứng đáng.</p>
      </div>
      <div className="sf-shop-layout">
        <aside className="sf-filters">
          <h3>
            <SlidersHorizontal size={17} /> Bộ lọc sản phẩm
          </h3>
          <fieldset>
            <legend>Danh mục</legend>
            {["", ...categories].map((c) => (
              <label key={c}>
                <input
                  type="radio"
                  name="category"
                  checked={category === c}
                  onChange={() => update("category", c)}
                />
                {c || "Tất cả sản phẩm"}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Thương hiệu</legend>
            <select
              aria-label="Lọc thương hiệu"
              value={brand}
              onChange={(e) => update("brand", e.target.value)}
            >
              <option value="">Tất cả thương hiệu</option>
              {[...new Set(products.map((p) => p.brand))].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </fieldset>
          <button className="sf-text-button" onClick={() => setParams({})}>
            Xóa tất cả bộ lọc
          </button>
        </aside>
        <section>
          <div className="sf-shop-toolbar">
            <p>
              {filtered.length} sản phẩm{query && <> cho “{params.get("q")}”</>}
            </p>
            <select
              aria-label="Sắp xếp sản phẩm"
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="featured">Nổi bật</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
          {filtered.length ? (
            <div className="sf-product-grid sf-shop-products">
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="sf-empty">
              <h2>Chưa tìm thấy sản phẩm</h2>
              <p>Thử từ khóa hoặc danh mục khác để tiếp tục khám phá.</p>
              <Link className="sf-button" to="/shop">
                Xem tất cả <ArrowRight size={16} />
              </Link>
            </div>
          )}
          <p className="sf-demo-note">
            Bộ sưu tập minh họa giao diện. Giá và thông tin sản phẩm là dữ liệu
            mẫu.
          </p>
        </section>
      </div>
    </div>
  );
}
