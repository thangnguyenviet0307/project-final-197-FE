# Cấu trúc Frontend

Giỏ hàng được tách theo Customer ID: `storefront-cart-v2:customer:<encoded-id>`, khách chưa đăng nhập dùng `storefront-cart-v2:guest`. `cart.store.ts` theo dõi phiên đăng nhập và đổi giỏ ngay khi đổi tài khoản/đăng xuất, không gộp giỏ khách vào tài khoản. Mỗi giỏ lưu riêng trên trình duyệt hiện tại, đồng bộ tab chỉ theo đúng khóa; lỗi storage vẫn giữ giỏ riêng trong bộ nhớ. Giỏ dùng chung v1 cũ không được tự gán vì không xác định được chủ sở hữu. Chọn mua không lưu và được xóa khi đổi tài khoản. Kết quả checkout/tải lại sản phẩm của phiên cũ không được sửa giỏ tài khoản mới.

Khách chưa đăng nhập vẫn đặt hàng COD tại `/checkout`. Service gọi POST `/storefront/checkout` qua HTTP client không tự refresh đăng nhập và không gửi cookie; khách đã đăng nhập tiếp tục dùng `/customer-auth/orders`. BE dùng chung luồng kiểm tra giá/tồn kho/địa chỉ và transaction tạo đơn, lưu khách vãng lai với `customerId=null`, snapshot người nhận và cờ `guestCheckout`, không tạo tài khoản. Gửi lại cùng requestId/body không giữ kho lần hai. Trang thành công cho khách vãng lai hiển thị mã đơn cần lưu và liên kết tiếp tục mua sắm; lịch sử/hủy đơn tài khoản vẫn yêu cầu đăng nhập và đúng chủ sở hữu.

Khi tự điền địa chỉ từ hồ sơ, đối chiếu tên địa phương không phân biệt hoa/thường, dấu, khoảng trắng hoặc tiền tố Tỉnh/Thành phố/Phường/Xã. Phường/xã khớp duy nhất được ưu tiên hơn quận/huyện cũ; trường hợp trùng tên cần chọn lại. Khi lưu hồ sơ với tỉnh hoặc phường/xã đã đổi, xóa quận/huyện cũ khỏi địa chỉ lưu.

Checkout chỉ hiển thị ô Tỉnh/Thành phố và Phường/Xã. Danh sách phường/xã lấy từ toàn bộ tỉnh đã chọn; mã quận/huyện được suy ra nội bộ để gửi đúng hợp đồng API ba cấp hiện có. Đổi tỉnh xóa lựa chọn địa phương cũ.

Checkout lấy hồ sơ mới nhất qua `useProfile`, dùng `features/checkout/utils/checkout-profile.ts` để điền tên, điện thoại và địa chỉ. Địa chỉ lưu hỗ trợ thêm quận/huyện tùy chọn; chỉ tự chọn mã địa phương khi khớp duy nhất. Giữ nguyên các trường đang sửa khi hồ sơ tải lại. Đặt hàng thành công bổ sung điện thoại/địa chỉ còn thiếu trong transaction BE, giữ thông tin đã lưu và làm mới cache hồ sơ/khách hàng.

Đơn hàng của tôi (`/account/orders`) ghép `features/orders/components/customer-order-card.tsx`, badge màu theo trạng thái và dialog hủy đơn. Mỗi thẻ hiển thị snapshot sản phẩm, đơn giá sau giảm/thành tiền, người nhận/địa chỉ và tổng server. Chỉ đơn Chờ xử lý có nút Hủy đơn hàng; dialog yêu cầu lý do, gọi PATCH `/customer-auth/orders/:id/cancel` qua service/hook, giữ lý do khi lỗi và làm mới orders/products khi thành công. Không thêm sản phẩm đã hủy trở lại giỏ tự động. Ô Thanh toán trong checkout giữ COD duy nhất với thẻ chọn và nút đỏ có trạng thái gửi; không thay đổi luồng tạo đơn.

Giỏ hàng hiện lưu riêng theo tài khoản hoặc khách trong localStorage, khôi phục khi tải lại/mở tab mới và đồng bộ thêm/sửa/xóa giữa các tab cùng tài khoản và cùng origin qua storage event. `features/cart/utils/cart-storage.ts` kiểm tra dữ liệu và chỉ lưu snapshot catalog công khai, biến thể, số lượng. Trạng thái tích chọn không lưu/đồng bộ; lỗi storage vẫn cho phép dùng giỏ trong bộ nhớ. Cơ chế này thay thế hành vi giỏ mất khi tải lại được mô tả trước đây.

Nút Mua hàng trong giỏ dẫn đến `/checkout` khi có sản phẩm được chọn. Trang có thanh quay lại toàn chiều ngang, sản phẩm/thông tin nhận hàng bên trái (2/3), tóm tắt đơn/COD bên phải (1/3). Danh sách mặc định hiện dòng đầu, có mở rộng/thu gọn. `features/checkout` sở hữu form React Hook Form/Zod, types, service và hooks TanStack Query. Các select tỉnh/thành → phường/xã dùng bộ địa chỉ ba cấp trước 07/2025, tự suy ra mã quận/huyện từ `/customer-auth/checkout-locations`; đổi cấp cha xóa cấp con, lỗi tải có Thử lại. Form tự điền thông tin từ hồ sơ mới nhất; đặt hàng thành công chỉ bổ sung điện thoại/địa chỉ còn thiếu. POST `/customer-auth/orders` chỉ dành cho Customer, gửi mã địa phương, dòng được chọn và đơn giá kỳ vọng; server xác thực quan hệ địa phương, kiểm tra giá/tồn kho/catalog, giữ kho và tạo đơn Pending/COD chưa gán nhân viên trong transaction. Giá/tổng do server tính; giá thay đổi trả 409 để khách xem lại, không tự chấp nhận giá mới. Thành công hiển thị mã đơn/tổng server và link lịch sử, chỉ trừ số lượng đã mua khỏi giỏ, giữ dòng chưa chọn/phần tăng thêm trong lúc gửi; lỗi giữ form/giỏ. Gửi lại sau lỗi kết nối dùng cùng requestId và body trong lần mở trang hiện tại để không giữ kho/tạo đơn hai lần. Có cảnh báo rời trang khi còn bản nháp/yêu cầu chưa rõ kết quả; không tự retry mutation.

Mỗi lần mở lại trang giỏ hàng, `clearSelection` bỏ chọn toàn bộ dòng; nút chọn tất cả trở về chưa chọn, tạm tính về 0 ₫. Danh sách sản phẩm, biến thể và số lượng được giữ nguyên.

Mỗi dòng giỏ có checkbox chọn mua, dòng mới mặc định được chọn. Tóm tắt chỉ tính đơn giá × số lượng của các dòng được chọn; bỏ chọn tất cả hiển thị 0 ₫. Đổi số lượng/biến thể giữ lựa chọn; gộp biến thể chọn dòng đích nếu một trong hai dòng được chọn. Badge header vẫn đếm toàn bộ giỏ.

Trong mỗi ô giỏ hàng, bộ số lượng nằm ở mép phải và nút xóa nằm ở góc dưới bên phải. `cart-remove-confirmation.tsx` mở dialog xác nhận; chỉ nút Xác nhận xóa mới loại sản phẩm khỏi giỏ, Hủy/đóng giữ nguyên sản phẩm. Trên màn hình nhỏ, nhóm thao tác xuống dưới nội dung và căn phải.

Bộ tăng/giảm số lượng nằm ở mép phải mỗi ô sản phẩm (`features/cart/components/cart-quantity.tsx`), giới hạn theo số lượng đặt tối thiểu và tồn kho của biến thể đã tải. Giá dưới ô biến thể luôn hiển thị đơn giá của biến thể đã chọn, giữ nguyên khi tăng/giảm số lượng; tạm tính và header tính đơn giá × số lượng.

Ô biến thể trong giỏ dùng `features/cart/components/cart-variant-picker.tsx`: nút mũi tên phải mở dialog giữa màn hình, hiển thị các biến thể thực tế dưới dạng lựa chọn và nút Xác nhận. Đóng dialog bỏ lựa chọn chưa xác nhận; chỉ Xác nhận mới cập nhật giỏ. Biến thể thiếu tồn kho (kể cả số lượng đã có ở dòng đích) không chọn được.

Giỏ hàng có ô chọn biến thể giữa tên sản phẩm và đơn giá. Đổi biến thể cập nhật ảnh, giá đã giảm, tạm tính và header từ dữ liệu catalog lưu lúc thêm. Nếu biến thể đích đã có trong giỏ, gộp số lượng; nếu không đủ tồn kho, giữ lựa chọn cũ. Số lượng vẫn ẩn trong ô sản phẩm.

Nút giỏ hàng trên header dẫn đến `/cart` trong `StoreLayout`. Trang chi tiết thêm sản phẩm/biến thể và số lượng vào `stores/cart.store.ts` (Zustand trong bộ nhớ, mất khi tải lại). Mỗi ô sản phẩm hiển thị ảnh, tên và đơn giá lúc thêm; ẩn tên biến thể và số lượng. Giỏ giữ tạm tính và cho xóa sản phẩm. Thêm trùng gộp số lượng theo sản phẩm/biến thể, kiểm tra số lượng tối thiểu và tồn kho đã tải. Header hiển thị tổng số lượng và tạm tính; chưa có checkout hoặc lưu giỏ trên Backend.

Khi deploy Vite SPA lên Vercel, `vercel.json` ở gốc repository FE rewrite URL về `/index.html` để React Router xử lý truy cập trực tiếp và tải lại các route như `/auth/login`, `/auth/products`, `/shop/:slug` và `/account/profile`. Vercel tiếp tục ưu tiên file tĩnh có thật. Chọn Framework Preset Vite, Output Directory `dist`, Build Command `pnpm build`; để `VITE_BASENAME` trống khi ứng dụng chạy ở `/`. Sau khi deploy, kiểm tra mở trực tiếp và F5 các URL này; route được bảo vệ vẫn yêu cầu đăng nhập và route không tồn tại vẫn dùng trang 404 của ứng dụng.

Khu vực `/account` dùng hồ sơ customer (họ, tên, ngày sinh, giới tính, một email đăng nhập chỉ đọc, điện thoại), địa chỉ giao hàng riêng và lịch sử đơn hàng qua `/customer-auth/me`, `/customer-auth/shipping-address`, `/customer-auth/orders`. Schema nằm trong `features/profile/schemas/customer-account-schema.ts`; API/query đơn hàng khách nằm trong `features/orders/`. Chưa triển khai checkout/tạo đơn mua hàng từ storefront. Trang 404 storefront giữ `StoreLayout`; `/auth/*` có giao diện 404 quản trị riêng.

Bảng quản trị `/auth/customers` đọc `/customers`, giữ `birthDate`, `gender` và `shippingAddress` trong service mapping. Bảng và dialog ưu tiên địa chỉ giao hàng mới; `address` cũ chỉ dùng khi chưa có `shippingAddress`. Hiển thị riêng email tài khoản và email nhận hàng. Tín hiệu cập nhật giữa các tab làm mới cache `customers`; có nút làm mới danh sách thủ công.

Storefront dùng utility `store-container` trong `src/index.css`: rộng tối đa 1440px, căn giữa và padding ngang 20px. Header, navbar, footer, nội dung trang và skeleton dùng chung utility này để thẳng hàng; các form hoặc khối nội dung nhỏ vẫn có thể giới hạn chiều rộng bên trong.

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

| Nội dung                                         | Vị trí                                           |
| ------------------------------------------------ | ------------------------------------------------ |
| UI dùng nhiều nơi, không chứa nghiệp vụ riêng    | `components/`, primitives trong `components/ui/` |
| Header, footer, sidebar, khung trang             | `layout/<khu-vực>/`                              |
| Trang theo khu vực sử dụng                       | `pages/<khu-vực>/<nghiệp-vụ>/`                   |
| Logic, API, component, hook riêng một nghiệp vụ  | `features/<nghiệp-vụ>/`                          |
| Hook React tổng quát                             | `hooks/`                                         |
| React Context và provider                        | `context/`                                       |
| Trạng thái Zustand toàn ứng dụng                 | `stores/`                                        |
| HTTP client và query client dùng chung           | `services/`                                      |
| Hàm tiện ích tổng quát                           | `utils/`                                         |
| Kiểm tra dữ liệu của từng nghiệp vụ              | `features/<nghiệp-vụ>/schemas/`                  |
| Kiểu dữ liệu của từng nghiệp vụ                  | `features/<nghiệp-vụ>/types/`                    |
| Query, mutation và cập nhật cache nghiệp vụ      | `features/<nghiệp-vụ>/hooks/`                    |
| Hợp đồng response/error và phân trang dùng chung | `types/api.ts`                                   |
| Cấu hình bằng code, chẳng hạn tên font/theme     | `config/`                                        |

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

Storefront có homepage `/`, `/contact`, `/shop`, `/shop/:slug` và trang thành viên `/thanh-vien?act=login|register`; `/account/login` và `/register` là URL tương thích. `/landing` nằm trong `pages/public/landing/`. Xác thực khách dùng `/customer-auth`; account yêu cầu `accountType=customer`. Hồ sơ, địa chỉ giao hàng và lịch sử đơn hàng dùng API riêng của khách như mô tả đầu tài liệu. Giỏ hàng và checkout chưa được triển khai. Thư mục trang mới không tự tạo URL.

Pages giữ giao diện, điều hướng và trạng thái URL; hook nghiệp vụ giữ query, mutation và cập nhật cache. Service không chứa schema form. `types/api.ts` cung cấp envelope, response, error và pagination dùng chung; endpoint có khác biệt metadata phải giữ đúng hợp đồng thay vì giả định mọi response giống nhau.

Sau khi merge code, đưa trang Brands/Customers vào `pages/admin/<nghiệp-vụ>/index.tsx`, component vào `features/<nghiệp-vụ>/components/`, API vào `services/` và kiểu dữ liệu vào `types/` của feature tương ứng. Không tạo lại `src/app/` hoặc import từ đường dẫn layout cũ. Brands và Customers dùng route `/brands`, `/customers`, cho admin/staff xem. Chỉ admin được sửa/xóa; staff được tạo hồ sơ khách hàng. Xem PROJECT_RULES.md để biết phân quyền chi tiết. Cache danh sách thương hiệu cho trang quản trị dùng `["brands", "management"]`; danh sách dùng trong form sản phẩm giữ `["brands"]` vì hai bên có định dạng dữ liệu khác nhau. Sau mutation, invalidate prefix `["brands"]` cập nhật cả hai.

Import dùng alias `@/`. Ví dụ:

```tsx
import { BaseLayout } from "@/layout/admin/base-layout";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/hooks/use-products";
import { pageNumbers } from "@/utils/pagination";
import { useAuthStore } from "@/stores/auth.store";
```

## Kiểm tra

Chạy `pnpm build`, `pnpm lint`, `pnpm test`. Trên PowerShell chặn script `.ps1`, dùng `pnpm.cmd` tương ứng. Lần tổ chức thư mục này giữ nguyên URL, phân quyền và logic nghiệp vụ.

## Admin contract updates

- Khối review store dùng `StoreRatingBreakdown` hiển thị điểm trung bình, tổng review và tỷ lệ 5–1 sao từ `ratingDistribution` trong public metrics (tính trên toàn bộ review). Số đánh giá tích cực là số review 4–5 sao, không phải số người mua đã xác thực. API public giới hạn tối đa 5 review/trang; nút “Viết đánh giá” nằm sau danh sách bình luận và phân trang, vẫn mở modal hai bước.

- Đánh giá storefront có nút “Viết đánh giá” ở giữa section và modal hai bước trong `WriteProductReview`: chọn sao, rồi nhập họ tên/nội dung bắt buộc, email/điện thoại tùy chọn; không upload ảnh. Schema ở `features/storefront/schemas/store-review-schema.ts`, service gửi POST `/products/public/:slug/reviews`, hook mutation invalidate prefix `products` để tải lại điểm và danh sách. BE gán nguồn `storefront`; UI ghi “Người dùng gửi”, không gắn nhãn đã mua hàng. Thông tin liên hệ lưu riêng, không trả ra public; lỗi giữ bản nháp và thành công trở về trang review đầu tiên.

- Store Product Details đặt đúng danh mục được gán (gốc hoặc con) ngay dưới tên sản phẩm, tiếp theo là thương hiệu; tags chỉ nằm cuối mô tả. Breadcrumb theo thứ tự Trang chủ / Danh mục được gán / Tên sản phẩm; danh mục liên kết đến bộ lọc tương ứng, liên kết quay lại danh sách riêng giữ URL trước đó. Gallery, chọn biến thể, giá, số lượng xem trước và các ô giao hàng/bảo hành/đổi trả nằm chung khung. Tab thông tin dùng table dọc, không lặp lại ba mục chính sách; tên thuộc tính như Material viết hoa chữ cái đầu. Không có sidebar tin tức. `StoreRatingSummary`/`StoreProductReviews` đọc metrics và review phân trang công khai (có luồng gửi đánh giá qua modal). `RelatedProducts` ở cuối trang đọc `/products/public/:slug/related`, hiển thị tối đa 5 sản phẩm cùng category, loại chính sản phẩm đang xem và các sản phẩm/catalog không hoạt động. Service/hook thuộc `features/storefront`, cùng cache prefix `products`; các khối có trạng thái tải, lỗi/thử lại và trống độc lập.

- `AdminStoreProductLink` ở danh sách/chi tiết Products quản trị mở `/shop/:slug` của sản phẩm BE đang hoạt động trong tab mới. Store dùng `features/storefront/services/catalog.service.ts` và hooks `use-store-products` để đọc `/products/public` và `/products/public/:slug` không cần đăng nhập; danh sách, chi tiết, sản phẩm mới trên trang chủ và menu không còn dùng sản phẩm fixture. Query dùng prefix `products` để dùng chung invalidation/sync với quản trị. Mô tả HTML được sanitize, biến thể hiển thị đúng giá sau giảm; đặt hàng vẫn chưa triển khai.

- Trang `/products/:id` dùng `ProductDetailGallery` để chọn ảnh thumbnail, ảnh quản lý, ảnh nguồn và ảnh biến thể; tự quay về ảnh đầu khi ảnh đang chọn không còn trong dữ liệu mới. Tổng quan hiển thị giá VND sau giảm theo utility dùng chung, trạng thái, tồn kho và thời gian theo định dạng Việt Nam. Giữ URL danh sách khi quay lại hoặc chuyển sang chỉnh sửa.

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


## Browser routes and independent authentication

Admin browser routes use `/auth/...`; only admin/staff roles are accepted. User login/profile/refresh/logout/password APIs remain `/auth/...`. Store membership uses `/thanh-vien?act=login|register`; its APIs use `/customer-auth/...` and return `accountType: "customer"` without an administrative role. Frontend session parsing, guards, header, profile, password changes and refresh choose the matching area. Tokens and refresh cookies are isolated by account type; passwords/tokens are never persisted in browser storage.

Customer registration creates only one account in the Backend customers collection. Users contains only administrative accounts. Email, passwords and profiles are independent across collections, even when fields match. Customer self-profile includes contact address; administrative profiles retain their existing avatar flow. The administrative Customer creation form/hook/service/action is removed. The backend denies administrative creation, and management lists only registered customers. Existing manual contacts remain stored for order history.

See [CUSTOMER_ACCOUNT_MIGRATION.md](CUSTOMER_ACCOUNT_MIGRATION.md) for the coordinated Backend/Frontend cutover, current inspection report and database approval boundary.


Product merchandising: Product stores on_sale (default true), is_best_seller/is_new/is_hot/is_home (default false). Legacy missing on_sale remains sellable; other missing flags are false. Admin can edit these fields in the full product form or PATCH /products/:id/flags with expectedVersion and one or more boolean flags. The strict quick-update endpoint rejects unrelated metadata, inventory and missing versions; ProductUpdate permission excludes staff/customers. Conflicts require explicit reload/review. Queries support exact true/false flag filters; false on_sale selects explicitly stopped products. Storefront lists/details/reviews/related exclude on_sale=false and still require active product/category/brand. The product section has independent Home/New/Featured filters (Home selected initially); Featured reads is_hot and Home reads is_home, with eight visible desktop slots; an empty selection shows an empty state. Best Seller/New/Hot are manual labels, not calculated sales/views. Product mutations invalidate the products prefix, retaining existing cross-tab synchronization.

Admin product search includes On sale/Best Seller/New/Hot/Home selects with All/true/false choices. Filters combine on the server, persist in the list URL, reset pagination when changed, and are removed by Reset. Invalid flag URL values are ignored.

Home product sections share ProductSection: a fixed-height two-row carousel (four visible columns/eight slots on desktop, two columns on mobile). Each arrow moves exactly one column with a 450ms transform transition; reduced-motion disables animation. Server pages of eight are loaded lazily and retained; the last window overlaps earlier columns rather than shrinking to a short final page. Empty/loading/error states retain the same frame, with blank slots when needed. Offscreen cards are inert and hidden from accessibility navigation. Home filters reset the column; each section scrolls independently. A separate Best Seller section reads is_best_seller=true regardless of is_home. This manual boolean is available in admin quick flags, full form and filters. Most View is removed from the storefront, including the count_view sort option. count_view is read-only in admin. POST /products/public/:slug/views accepts only an empty JSON body and atomically increments count_view by one for a public sellable product with active catalog references; missing/hidden returns 404. Counter writes leave __v and updatedAt untouched. GET detail/list/metrics/reviews do not increment views. The detail hook records once per successful product navigation, including cached navigation, using location.key; rerenders, background refetch and StrictMode effect replay do not add views. Refresh/re-entry counts another visit; this is a raw visit count, not unique visitors. Failed view writes are not retried automatically. No historical counts or automatic best-seller ranking are fabricated.

Home sections alternate full-width white/light-gray backgrounds. Product sections omit eyebrow text, visible item counters and the bottom catalog link; the heading retains View all. The main heading is Sản phẩm, with Home/New/Featured filters and Home selected initially. Product cards display the discounted selling price first, original price struck through, then the actual discount percentage; products without a positive discount show only their selling price. Prices and discounts come from the same product/lowest-priced variant mapping.

Carousel row height now equals the actual card height, including placeholder slots; arrows center on the two full card rows without an unused footer offset. Product cards use a fixed 4:3 media box, two reserved metadata lines, two title lines and a reserved price area. View counts are displayed only in admin; storefront cards omit them. Hover changes shadow/image only, never card position, keeping row alignment stable.

Home omits the benefits strip, collection gallery and quick category links. Product sections follow the hero directly. Explore navigation targets /#san-pham. The departments menu contains public category branches only, with no All Products row, product preview or product-list query. Its white panel starts directly at the black trigger bottom. Hero keeps only the left slide selectors, aligned to the shared store-container; right previous/next buttons are removed.

Hero is API-driven: GET /hero-slides/public supplies only active slides with active, non-deleted categories; empty configuration shows a generic welcome hero at the same reserved height (420px mobile/500px desktop minimum), linking to /shop, and failures retain the explicit retry state. Admin-only /auth/hero-slides (sidebar: Danh mục > Hero trang chủ) manages custom title (1-200), description (0-1000), category, optional HTTP(S) imageUrl, sortOrder (integer 0-10000) and isActive. Image fallback uses category.icon, then a dark background. CTA is always Khám phá + current category name and links by category ID. POST/GET/PATCH/DELETE /hero-slides require HeroManage permission (admin only), strict inputs, a 50-slide cap and active category validation for creation/category changes/enabling. Update/delete require the original __v as expectedVersion; draft forms are preserved on failure and cannot retry a 409 until explicit reload. Admin edits submit only changed fields and do not take a new version from background refetch. Deletion is confirmed. Public projections omit version/status/timestamps; the query prefix is hero-slides and participates in catalog invalidation and cross-tab sync. Category deactivation/deletion hides affected slides publicly without altering their stored content. No seed/migration inserts hero slides automatically. The public hero retains 6.5-second autoplay, stable selection by slide ID and only the left container-aligned selectors.

Hero management is grouped under the admin sidebar Danh mục, alongside Danh sách danh mục; there is no separate top-level Hero item. Staff retain the existing direct category link and do not see hero management. Existing hero API URLs and the admin-only page route remain unchanged.

The obsolete is_best flag is removed from product models, contracts, form fields, quick columns and filters. Best Seller has its own section. Product buttons are Trang chủ (is_home), Mới (is_new), Nổi bật (is_hot), with Trang chủ selected initially. Each queries its own flag without also requiring is_home; Trang chủ explicitly exposes Home-only selections. Existing stored is_best values are unused; no production cleanup/migration is executed. Hero title/description/CTA share overlapping grid tracks across all slides; hidden slides reserve their height, keeping row positions and section height stable for short/long or missing descriptions. Inactive text/links are hidden from accessibility navigation and the content no longer animates vertically.

The storefront product tabs are Trang chủ, Mới, Nổi bật in that order; default is Trang chủ. They independently query is_home, is_new, is_hot. There is no separate Hot/Hay xem tab. is_best_seller is used only for the dedicated Best Seller section. The Most View section and sortBy=count_view support are removed; the Product count_view model field, public visit-increment endpoint/hook, and admin read-only view count remain active and existing counts are preserved.

Bộ lọc `/shop`: CSS chuyển động và khung loading nằm trong `pages/storefront/products/catalog-filters.css`; hook `use-store-filter-count` gộp thay đổi trong 180ms, chỉ đếm khi popup mở và khóa xác nhận trong lúc chờ. Lưới sản phẩm được memo hóa để thay đổi bản nháp không dựng lại các thẻ phía sau.


Demo cleanup: pages/template, public/landing, fake appearance/notifications/connections/billing/account settings and old dashboard fixture widgets are removed. Real profile settings and shared UI remain. See removed-demo-files.md for the exact file list.
