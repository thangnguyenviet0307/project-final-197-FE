# Admin and storefront UI review — 2026-11-05

The two interfaces remain distinct. Admin retains its neutral, compact dashboard theme with light/dark support. Storefront retains its light surfaces, green actions and customer navigation. Business services and reusable primitives remain shared where appropriate; no auth/permission/database changes were made during this review.

## Findings and fixes

| Area | Finding | Fix |
| --- | --- | --- |
| Storefront layout | Shared semantic colors could inherit the admin document's dark palette outside account/auth-specific wrappers | Isolated light/green palette on `.storefront-ui`; scoped input/textarea caret, background and button-variant colors |
| Storefront account | Account action colors differed from storefront auth; the vertical account menu pushed content below the first mobile screen | Consistent storefront action token; horizontal scrollable account navigation on mobile, original sidebar on desktop |
| Admin warranty | Selected request used a fixed light green surface; status badges used the customer light palette | Semantic accent/ring selection and separate light/dark admin status palette |
| Notifications | Storefront toasts followed the saved administrative theme | Light storefront notifications, active theme for administrative notifications |
| Admin forms | Some saving/deleting/loading/search and password-help labels were in English | Vietnamese text in profile, brand/category forms, brand deletion, order creation, user search and password help |

## Browser review

Local production build in isolated headless Chrome, at desktop 1365px and mobile 390px widths. API calls were intercepted with controlled fixtures, including a sample accepted warranty, empty catalog/management lists and a test profile. No real credentials, email delivery, API mutations or production data were used.

Reviewed storefront routes: `/`, `/shop`, `/bai-viet`, `/cart`, `/checkout`, `/contact`, `/thanh-vien?act=login`, `/thanh-vien?act=register`, `/quen-mat-khau`, `/account/profile`, `/account/addresses`, `/account/warranty`, `/account/change-password`, `/chinh-sach-bao-hanh`.

Reviewed administrative routes: `/auth/login`, `/auth/products`, `/auth/categories`, `/auth/brands`, `/auth/orders`, `/auth/users`, `/auth/warranties`, `/auth/settings/user`.

Supplemental light-theme checks covered `/auth/users/new`, `/auth/products/new`, `/auth/brands/new`, `/auth/categories/new` and warranty views in both areas at both viewport sizes. Mobile account-navigation screenshots were refreshed after its layout change. The reviewed screens did not produce document-level horizontal overflow at the tested widths; intentional account-tab/table scrolling stays inside its container.

The local reports contain 26 distinct routes and 64 viewport/theme/selection observations, including opening warranty detail and checking its selected row. This is representative UI coverage, not a claim that every application state was visually tested.

Both flows were checked under a stored dark theme to detect cross-area color leakage, with supplemental light-theme/form checks. Screenshots and computed-style/viewport reports are local review artifacts in `.local-backups/ui-audit/` (ignored by Git). Browser observations are limited to the rendered fixtures and tested viewport sizes; they do not establish exhaustive coverage of every populated detail/editor, validation failure, popup or real backend response.

## Automated verification

Use the existing `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd test`, `pnpm.cmd test:contracts` and `pnpm.cmd build` checks. Added regression checks verify that storefront form/button overrides do not scope to administrative controls, and that notifications retain separate storefront/admin themes. Existing warranty and auth tests cover the reused business behavior.
