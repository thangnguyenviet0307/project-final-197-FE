# Cấu trúc Frontend

Dự án dùng React, Vite, TypeScript, React Router, Zustand và TanStack Query. Cấu trúc áp dụng cách phân chia trách nhiệm trong hình mẫu, kết hợp module nghiệp vụ trong `features`.

```text
public/                         # File tĩnh được phục vụ nguyên trạng bằng URL
src/
├── assets/                     # Ảnh, font, icon được import và xử lý bởi Vite
├── components/                 # UI tái sử dụng: ui/, avatar, logo, skeleton, theme…
├── layout/
│   ├── root-layout.tsx         # Khung gốc và trạng thái chuyển trang
│   └── admin/                  # BaseLayout, sidebar, header, footer, navigation
├── pages/
│   ├── admin/                  # products/, orders/, users/, categories/,
│   │                           # account/, dashboard/, dashboard-2/, settings/
│   ├── auth/                   # Đăng nhập, quên mật khẩu, đổi mật khẩu
│   ├── public/landing/         # Landing page công khai hiện tại
│   ├── storefront/             # Khu vực dành cho các trang bán hàng sắp phát triển
│   ├── errors/                 # 403, 404, lỗi máy chủ…
│   └── template/               # Chat, mail, calendar, tasks, FAQ, pricing,
│                               # các biến thể form auth mẫu
├── features/
│   ├── auth/                   # components/, hooks/, services/, types/, schemas/
│   ├── profile/                # hooks/, schemas/
│   ├── users/                  # components/, hooks/, services/
│   ├── products/               # components/, hooks/, services/, types/, schemas/, utils/
│   ├── orders/                 # components/, hooks/, services/, types/, utils/
│   ├── categories/             # hooks/, services/
│   └── brands/                 # hooks/, services/, types/
├── hooks/                      # Hook dùng chung: layout/, theme/
├── context/                    # Context theme/sidebar và ThemeProvider
├── stores/                     # Zustand state dùng toàn ứng dụng: auth.store.ts
├── services/
│   ├── api.ts                  # Axios client, token refresh và HTTP dùng chung
│   └── query-client.ts         # Query client, cache và xử lý lỗi
├── utils/                      # cn, pagination, data-table, api-error, analytics,
│                               # theme presets dùng chung
├── config/                     # Cấu hình font và theme
├── types/                      # Kiểu dùng chung cho theme và mutation
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
| Cấu hình bằng code, chẳng hạn tên font/theme | `config/` |

Không tạo `redux/` vì ứng dụng đang dùng Zustand. State cục bộ giữ trong component; state từ API dùng TanStack Query; session dùng `stores/auth.store.ts`. Chỉ thêm thư mục khi có code thực tế.

`public/` chứa tài nguyên truy cập trực tiếp như `/favicon.png`; `src/assets/` chứa file được import từ code. `config/fonts.ts` khai báo cấu hình font, không phải file font nhị phân.

## Thêm website bán hàng

1. Đặt trang cho khách tại `pages/storefront/`, ví dụ `products/index.tsx`, `products/detail.tsx`, `cart/index.tsx`, `checkout/index.tsx`.
2. Tạo layout khách hàng trong `layout/storefront/` khi triển khai. Trang quản trị tiếp tục dùng `layout/admin/`.
3. Dùng lại nghiệp vụ từ `features/products/`, `features/categories/`, `features/brands/` khi phù hợp. Kiểm tra hook có điều hướng quản trị trước khi dùng cho khách hàng.
4. Nghiệp vụ mới như giỏ hàng đặt tại `features/cart/`, với các thư mục con thực sự cần: `components`, `hooks`, `services`, `types`, `schemas`, `utils`.
5. Đăng ký URL và quyền trong `router/routes.tsx`. Thư mục không tự tạo route. Dashboard hiện dành cho admin/staff; storefront cần cơ chế tài khoản khách phù hợp khi phát triển.

Component riêng một trang có thể nằm trong `components/` con cạnh trang đó. CSS riêng nằm cạnh trang/component; global styles giữ ở `src/index.css`. Trang mẫu được giữ để tham khảo. `pages/storefront/` hiện chỉ có hướng dẫn, chưa có trang hoạt động.

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
