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

Menu danh mục storefront dùng `features/categories/hooks/use-public-categories.ts` và GET `/categories/public` để hiển thị cây danh mục, ảnh, trạng thái tải/lỗi/trống. Chưa có điều hướng từ danh mục sang trang sản phẩm.

## Thêm website bán hàng

1. Đặt trang cho khách tại `pages/storefront/`, ví dụ `products/index.tsx`, `products/detail.tsx`, `cart/index.tsx`, `checkout/index.tsx`.
2. Dùng layout khách hàng hiện có trong `layout/storefront/`. Trang quản trị tiếp tục dùng `layout/admin/`.
3. Dùng lại nghiệp vụ từ `features/products/`, `features/categories/`, `features/brands/` khi phù hợp. Kiểm tra hook có điều hướng quản trị trước khi dùng cho khách hàng.
4. Nghiệp vụ mới như giỏ hàng đặt tại `features/cart/`, với các thư mục con thực sự cần: `components`, `hooks`, `services`, `types`, `schemas`, `utils`.
5. Đăng ký URL và quyền trong `router/routes.tsx`. Thư mục không tự tạo route. Dashboard hiện dành cho admin/staff; storefront cần cơ chế tài khoản khách phù hợp khi phát triển.

Component riêng một trang có thể nằm trong `components/` con cạnh trang đó. CSS riêng nằm cạnh trang/component; global styles giữ ở `src/index.css`. Trang mẫu được giữ để tham khảo trong `pages/template/`; mẫu Users và dữ liệu minh họa nằm ở `pages/template/users/`, không được đăng ký route.

Storefront có homepage `/`, `/contact`, đăng ký `/register` và đăng nhập khách hàng `/account/login`; `/landing` nằm trong `pages/public/landing/`. Đăng ký gọi `/auth/register`, thành công chuyển sang đăng nhập; đăng nhập thành công về homepage. Các trang /account được bảo vệ bằng role customer. Hồ sơ dùng GET/PATCH /auth/me; đổi mật khẩu dùng POST /auth/change-password và đưa khách về /account/login. Đơn hàng và địa chỉ vẫn là bản xem trước. Catalog công khai, giỏ hàng và checkout chưa được đăng ký trong router. Thư mục trang mới không tự tạo URL.

Pages giữ giao diện, điều hướng và trạng thái URL; hook nghiệp vụ giữ query, mutation và cập nhật cache. Service không chứa schema form. `types/api.ts` cung cấp envelope, response, error và pagination dùng chung; endpoint có khác biệt metadata phải giữ đúng hợp đồng thay vì giả định mọi response giống nhau.

Sau khi merge code, đưa trang Brands/Customers vào `pages/admin/<nghiệp-vụ>/index.tsx`, component vào `features/<nghiệp-vụ>/components/`, API vào `services/` và kiểu dữ liệu vào `types/` của feature tương ứng. Không tạo lại `src/app/` hoặc import từ đường dẫn layout cũ. Brands và Customers dùng route `/brands`, `/customers`, cho admin/staff xem. Chỉ admin được sửa/xóa; staff được tạo hồ sơ khách hàng. Xem PROJECT_RULES.md để biết phân quyền chi tiết. Cache danh sách thương hiệu cho trang quản trị dùng `["brands", "management"]`; danh sách dùng trong form sản phẩm giữ `["brands"]` vì hai bên có định dạng dữ liệu khác nhau. Sau mutation, invalidate prefix `["brands"]` cập nhật cả hai.

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

- Products: form tạo/sửa hỗ trợ SKU sản phẩm, mã vạch, nhãn, khối lượng (kg), ba kích thước (cm), chính sách bảo hành/giao hàng/đổi trả và số lượng đặt tối thiểu. Năm sản xuất không bắt buộc; chỉ gửi metadata thay đổi. Thông tin nguồn import và ảnh nguồn chỉ hiển thị ở chi tiết, không gửi trong payload chỉnh sửa.
- Chi tiết Products ghép `ProductDetailsInfo` và `ProductReviews`. Hook `use-product-reviews` lấy metrics/reviews qua service riêng, quản lý mutation và invalidate cache `products/metrics` cùng `products/reviews`. Admin được thêm/xóa review, staff chỉ xem; điểm trung bình và số lượng đã bán do BE tính. Không gọi API metrics riêng cho từng dòng danh sách.
- Trang Khách hàng chỉ hiển thị hồ sơ liên hệ `/customers`; đăng ký mới tạo User và Customer trong cùng transaction, liên kết bằng `accountId`. Điện thoại/địa chỉ chưa cung cấp được để trống. `/users` chỉ liệt kê admin/staff; không tự ghép hồ sơ cũ theo email hoặc tự chuyển dữ liệu đã có.

- Đăng nhập store tại `/account/login` chỉ chấp nhận customer; admin/staff nhận lỗi, không lưu phiên frontend và thu hồi phiên cookie vừa cấp. Phiên admin/staff có sẵn mở trang đăng nhập/đăng ký store cũng nhận lỗi, không tự chuyển dashboard. Đăng nhập quản trị tại `/login` giữ điều hướng theo role và URL quản trị đã yêu cầu; bắt buộc đổi mật khẩu được ưu tiên cho tài khoản hợp lệ.

- Deploy the corresponding Backend changes together with the Frontend. Inventory/variant updates require `expectedVersion` from the product response `__v`; stale requests return 409 and preserve the editor input. Metadata-only partial updates still omit inventory.
- New Order items snapshot product/variant names and selected options alongside price/discount/SKU. Legacy missing snapshots are displayed as Not recorded; no historical data is backfilled.
- Catalog mutations invalidate both catalog keys and populated Products queries. Category deletion explains which direct children become roots.
- Users role/status filters and username ordering run before server pagination; rows and totals share the same filter. Handler selection requests active staff server-side.
- Product deletion queues managed gallery public IDs in the same transaction. The Backend worker retries Cloudinary cleanup from a durable outbox; it does not delete external thumbnail URLs.
- Category, Brand and User create forms share dirty-navigation/Cancel protection. Brand status is editable; descriptions retain the API contract without silently truncating existing values.
- Browser auth uses HttpOnly refresh cookies and in-memory access tokens; see [AUTH.md](../AUTH.md) for origin/HTTPS/same-site deployment requirements. Demo passwords remain unchanged by explicit user decision.

Quy tắc nghiệp vụ và lệnh pnpm hiện hành: [PROJECT_RULES.md](../PROJECT_RULES.md). Admin có liên kết “Trang Bán hàng” mở `/` trong tab mới.
