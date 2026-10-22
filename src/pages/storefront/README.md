# Giao diện bán hàng Amanto

Các trang khách hàng dùng chung `src/layout/storefront/storefront-layout.tsx` với header, navbar và footer. React Router render nội dung trang qua `Outlet`.

| URL | Nội dung |
| --- | --- |
| `/` | Trang chủ, banner chuyển slide, danh mục, sản phẩm nổi bật |
| `/shop` | Danh sách, tìm kiếm, lọc danh mục/thương hiệu, sắp xếp |
| `/:categorySlug/:slug` | Chi tiết, chọn số lượng, thêm vào giỏ |
| `/wishlist` | Sản phẩm yêu thích |
| `/cart` | Giỏ hàng, cập nhật số lượng, xóa, tổng tiền ước tính |
| `/contact` | Liên hệ và chính sách mẫu |

Trang chủ `/` thay điều hướng dashboard trước đây. Route quản trị và phân quyền giữ nguyên; dashboard tại `/admin/dashboard`.

## Cấu trúc

- `src/layout/storefront/`: khung trang dùng chung, header/navbar, footer, CSS responsive giới hạn dưới `.sf`.
- `src/features/storefront/catalog.ts`: catalog mẫu có kiểu dữ liệu, danh mục, định dạng tiền.
- `src/features/storefront/store.ts`: Zustand persist giỏ hàng/yêu thích, khóa localStorage `amanto-storefront-demo`.
- `src/features/storefront/product-card.tsx`: thẻ sản phẩm dùng chung.
- `src/pages/storefront/`: body riêng cho từng route.
- Query trên `/shop`: `q`, `category`, `brand`, `sort`, `sale`; hỗ trợ chia sẻ URL.

## Giới hạn bản giao diện

Catalog, giá, chính sách và thông tin liên hệ là dữ liệu mẫu. Ảnh từ Unsplash cần kết nối mạng. Không gọi API sản phẩm nội bộ; chưa hỗ trợ checkout, tạo đơn hay thanh toán thực tế. Khi có API khách hàng, thay fixtures bằng service/query phù hợp và xác thực lại giá/tồn kho trên server. Xem [hợp đồng storefront](../../../docs/storefront-contract.md).

Tham khảo bố cục: https://amanto-store-demo.myshopify.com/

Kiểm tra: `pnpm.cmd typecheck`, `pnpm.cmd test`, `pnpm.cmd build`.
