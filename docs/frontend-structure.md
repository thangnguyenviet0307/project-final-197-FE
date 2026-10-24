# Cấu trúc Frontend

Dự án dùng React, Vite, TypeScript, React Router, Zustand và TanStack Query. Cấu trúc áp dụng cách phân chia trách nhiệm trong hình mẫu, kết hợp module nghiệp vụ trong `features`.

```text
public/                         # File tĩnh được phục vụ nguyên trạng bằng URL
src/
├── assets/                     # Ảnh, font, icon được import và xử lý bởi Vite
├── components/                 # UI tái sử dụng: ui/, avatar, logo, skeleton, theme…
├── layout/
│   ├── root-layout.tsx         # Khung gốc và trạng thái chuyển trang
│   ├── admin/                  # BaseLayout, sidebar, header, footer, navigation
│   └── storefront/             # StoreLayout, AccountLayout, header, footer, navigation
├── pages/
│   ├── admin/                  # products/, orders/, users/, categories/, brands/, customers/,
│   │                           # account/, dashboard/, settings/
│   ├── auth/                   # Đăng nhập, quên mật khẩu, đổi mật khẩu
│   ├── public/landing/         # Landing page công khai hiện tại
│   ├── storefront/             # Contact và các trang account xem trước
│   ├── errors/                 # 403, 404, lỗi máy chủ…
│   └── template/               # Chat, mail, calendar, tasks, FAQ, pricing,
│                               # các biến thể form auth mẫu
├── features/
│   ├── auth/                   # components/, hooks/, services/, types/, schemas/
│   ├── profile/                # hooks/, schemas/
│   ├── users/                  # components/, hooks/, services/, schemas/, types/
│   ├── products/               # components/, hooks/, services/, types/, schemas/, utils/
│   ├── orders/                 # components/, hooks/, services/, types/, utils/
│   ├── categories/             # components/, hooks/, services/, schemas/, types/
│   ├── brands/                 # components/, hooks/, services/, types/
│   └── customers/              # components/, hooks/, services/, types/
├── hooks/                      # Hook dùng chung: layout/, theme/
├── context/                    # Context theme/sidebar và ThemeProvider
├── stores/                     # Zustand state dùng toàn ứng dụng: auth.store.ts
├── services/
│   ├── api.ts                  # Axios client, token refresh và HTTP dùng chung
│   └── query-client.ts         # Query client, cache và xử lý lỗi
├── utils/                      # cn, pagination, data-table, api-error, analytics,
│                               # theme presets dùng chung
├── config/                     # Cấu hình font và theme
├── types/                      # Hợp đồng API, theme và mutation dùng chung
├── router/                     # Routes, guards và auth bootstrap
├── App.tsx                     # Ghép providers và router
├── main.tsx                    # Điểm khởi tạo React
└── index.css                   # Global styles
 tests/                         # Test tự động (ở thư mục gốc)
 docs/                          # Tài liệu kỹ thuật và nghiệp vụ (ở thư mục gốc)
```

## Quy tắc đặt code

| Nội dung | Vị trí |
| --- | --- |
| UI dùng nhiều nơi, không chứa nghiệp vụ riêng | `components/`, primitives trong `components/ui/` |
| Header, footer, sidebar, khung trang | `layout/<khu-vực>/` |
| Trang theo khu vực sử dụng | `pages/<khu-vực>/<nghiệp-vụ>/` |
| Logic, API, component, hook riêng một nghiệp vụ | `features/<nghiệp-vụ>/` |
| Hook React tổng quát | `hooks/` |
| React Context và provider | `context/` |
| Trạng thái Zustand toàn ứng dụng | `stores/` |
| HTTP client và query client dùng chung | `services/` |
| Hàm tiện ích tổng quát | `utils/` |
| Kiểm tra dữ liệu của từng nghiệp vụ | `features/<nghiệp-vụ>/schemas/` |
| Kiểu dữ liệu của từng nghiệp vụ | `features/<nghiệp-vụ>/types/` |
| Query, mutation và cập nhật cache nghiệp vụ | `features/<nghiệp-vụ>/hooks/` |
| Hợp đồng response/error và phân trang dùng chung | `types/api.ts` |
| Cấu hình bằng code, chẳng hạn tên font/theme | `config/` |

Không tạo `redux/` vì ứng dụng đang dùng Zustand. State cục bộ giữ trong component; state từ API dùng TanStack Query; session dùng `stores/auth.store.ts`. Chỉ thêm thư mục khi có code thực tế.

`public/` chứa tài nguyên truy cập trực tiếp như `/favicon.png`; `src/assets/` chứa file được import từ code. `config/fonts.ts` khai báo cấu hình font, không phải file font nhị phân.

## Thêm website bán hàng

1. Đặt trang cho khách tại `pages/storefront/`, ví dụ `products/index.tsx`, `products/detail.tsx`, `cart/index.tsx`, `checkout/index.tsx`.
2. Dùng layout khách hàng hiện có trong `layout/storefront/`. Trang quản trị tiếp tục dùng `layout/admin/`.
3. Dùng lại nghiệp vụ từ `features/products/`, `features/categories/`, `features/brands/` khi phù hợp. Kiểm tra hook có điều hướng quản trị trước khi dùng cho khách hàng.
4. Nghiệp vụ mới như giỏ hàng đặt tại `features/cart/`, với các thư mục con thực sự cần: `components`, `hooks`, `services`, `types`, `schemas`, `utils`.
5. Đăng ký URL và quyền trong `router/routes.tsx`. Thư mục không tự tạo route. Dashboard hiện dành cho admin/staff; storefront cần cơ chế tài khoản khách phù hợp khi phát triển.

Component riêng một trang có thể nằm trong `components/` con cạnh trang đó. CSS riêng nằm cạnh trang/component; global styles giữ ở `src/index.css`. Trang mẫu được giữ để tham khảo trong `pages/template/`; mẫu Users và dữ liệu minh họa nằm ở `pages/template/users/`, không được đăng ký route.

Storefront hiện có `/contact` và `/account/*`; `/landing` nằm trong `pages/public/landing/`. Các trang account chỉ là bản xem trước, chưa có đăng nhập khách hàng hoặc lưu API. Catalog công khai, giỏ hàng và checkout chưa được đăng ký trong router. Thư mục trang mới không tự tạo URL.

Pages giữ giao diện, điều hướng và trạng thái URL; hook nghiệp vụ giữ query, mutation và cập nhật cache. Service không chứa schema form. `types/api.ts` cung cấp envelope, response, error và pagination dùng chung; endpoint có khác biệt metadata phải giữ đúng hợp đồng thay vì giả định mọi response giống nhau.

Sau khi merge code, đưa trang Brands/Customers vào `pages/admin/<nghiệp-vụ>/index.tsx`, component vào `features/<nghiệp-vụ>/components/`, API vào `services/` và kiểu dữ liệu vào `types/` của feature tương ứng. Không tạo lại `src/app/` hoặc import từ đường dẫn layout cũ. Brands và Customers dùng route `/brands`, `/customers`, được bảo vệ bằng quyền admin như menu quản trị. Cache danh sách thương hiệu cho trang quản trị dùng `["brands", "management"]`; danh sách dùng trong form sản phẩm giữ `["brands"]` vì hai bên có định dạng dữ liệu khác nhau. Sau mutation, invalidate prefix `["brands"]` cập nhật cả hai.

Import dùng alias `@/`. Ví dụ:

```tsx
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/features/products/hooks/use-products"
import { pageNumbers } from "@/utils/pagination"
import { useAuthStore } from "@/stores/auth.store"
```

## Kiểm tra

Chạy `pnpm build`, `pnpm lint`, `pnpm test`. Trên PowerShell chặn script `.ps1`, dùng `pnpm.cmd` tương ứng. Lần tổ chức thư mục này giữ nguyên URL, phân quyền và logic nghiệp vụ.

## Admin contract updates

- Deploy the corresponding Backend changes together with the Frontend. Inventory/variant updates require `expectedVersion` from the product response `__v`; stale requests return 409 and preserve the editor input. Metadata-only partial updates still omit inventory.
- New Order items snapshot product/variant names and selected options alongside price/discount/SKU. Legacy missing snapshots are displayed as Not recorded; no historical data is backfilled.
- Catalog mutations invalidate both catalog keys and populated Products queries. Category deletion explains which direct children become roots.
- Users role/status filters and username ordering run before server pagination; rows and totals share the same filter. Handler selection requests active staff server-side.
- Product deletion queues managed gallery public IDs in the same transaction. The Backend worker retries Cloudinary cleanup from a durable outbox; it does not delete external thumbnail URLs.
- Category, Brand and User create forms share dirty-navigation/Cancel protection. Brand status is editable; descriptions retain the API contract without silently truncating existing values.
- Browser auth uses HttpOnly refresh cookies and in-memory access tokens; see [AUTH.md](../AUTH.md) for origin/HTTPS/same-site deployment requirements. Demo passwords remain unchanged by explicit user decision.
