# Amanto homepage

Route `/` tải `index.tsx`. Thư mục này chỉ chứa body của trang chủ.

```text
homepage/
  index.tsx                         # Ghép các section theo thứ tự trang mẫu
  homepage.css                      # CSS riêng của homepage
  data.ts                           # Banner và các nhóm sản phẩm của homepage
  components/home-product-card.tsx  # Thẻ sản phẩm thường/thu gọn
  sections/
    hero-section.tsx                # Slider và điều khiển Headphone/Phone/Watch
    promotion-section.tsx           # Dịch vụ, Flycam/Projectors banners
    product-sections.tsx            # Featured Parts, Trending, ba cột sản phẩm
    deal-section.tsx                # Deal và countdown minh họa
    testimonials-section.tsx        # Testimonials carousel
```

Header/navbar/footer tiếp tục dùng chung tại `src/layout/storefront/`. Không import các section của homepage vào layout: những trang mới chỉ cần thêm route con trong `src/router/routes.tsx`.

Catalog dùng chung tại `src/features/storefront/`; ảnh và font tĩnh tại `public/storefront/amanto/`. Tên, ảnh và giá USD theo dữ liệu công khai của trang tham chiếu https://amanto-store-demo.myshopify.com/ . Đây là bản UI minh họa, không kết nối Shopify hoặc API checkout. Countdown dùng hạn cố định 31/12/2026 UTC, không reset theo mỗi lần tải trang. Newsletter hiển thị rõ chưa kết nối dịch vụ.

Kiểm tra: `pnpm.cmd build` và `pnpm.cmd exec vitest run tests/storefront.test.tsx tests/storefront-bootstrap.test.tsx tests/auth-routes.test.tsx`.
