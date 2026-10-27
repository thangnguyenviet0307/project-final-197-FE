# Project rules for AI Agents

Read this file and AGENTS.md before changing either repository. The backend contract is authoritative. Verify the current code; do not assume earlier chat or test counts describe the current checkout.

## Repositories and architecture

- Frontend: React, Vite, strict TypeScript, React Router, TanStack Query, Zustand. Backend: Node.js, Express, strict TypeScript, MongoDB/Mongoose in ../project-final-197-BE.
- Pages compose screens and URL state; feature hooks own queries/mutations/cache invalidation; services own HTTP; schemas own validation; types own contracts. Backend routes/controllers/services/models remain separate.
- Reuse business rules and forms across admin/storefront; do not copy authentication or password logic.
- Preserve Vietnamese labels and UTF-8 encoding. Preserve drafts on request failures. Do not overwrite dirty forms during background refetch.

## Package manager and verification

- Use pnpm exclusively. In PowerShell use pnpm.cmd when script execution is restricted. Do not create npm/yarn/bun lockfiles or use those tools to install or run tests.
- Frontend checks: pnpm.cmd typecheck; pnpm.cmd lint; pnpm.cmd test; pnpm.cmd test:contracts; pnpm.cmd build.
- Backend checks: pnpm.cmd typecheck; pnpm.cmd test. Database integration tests require a separately configured test database; never point tests/seeds at production.
- test:contracts reads the sibling Backend validation modules without HTTP or database connections. Passing it is not an end-to-end guarantee.
- Test permissions and rejected requests, not only successful paths. Include 409 conflicts, versioning, invalid inputs, login redirects and cache invalidation for affected flows.
- Report the exact commands, actual results and untested limitations. Do not claim a check passed if it did not run.

## Roles and authorization

- Admin manages staff accounts, catalog metadata, prices, images, brands/categories and destructive operations.
- Staff can read products/categories/brands/customers and all order history. Staff may create customer contact records, accept eligible orders and manage only their assigned open orders. Staff cannot edit prices/catalog metadata, delete orders/customers, reassign handlers or manage users.
- /brands is readable by admin/staff. Hide add/edit/delete controls from staff; /brands/new remains admin-only. Sidebar and command search must match route guards.
- Inventory is editable by admin/staff only through PATCH /products/:id/inventory. Send expectedVersion plus stock OR variant IDs/stocks; never send prices or catalog fields. Keep the input after 409 and require explicit reload/review before retrying with a new version. Products with variants derive aggregate stock from variants.
- Customer is an authenticated account role with NO admin/staff permissions. Public registration accepts only firstName, lastName, email, password; the server fixes role=customer, active=true and hashes the password. Never accept role/activation/token fields from registration.
- Registration creates a customer User and Customer contact atomically, linked by Customer.accountId. Phone/address remain blank until supplied. Do not link existing contacts by email or expose contact/order records to buyers without a separate ownership design. Earlier registrations are not backfilled automatically.
- /users lists admin/staff accounts, excluding customer accounts. Customer registration must not grant access to staff API endpoints.
- The admin Customers page displays only the contact list via GET /customers; new registrations appear in that list and its statistics. Use Customer IDs for contact actions, never User IDs. Users still excludes customer accounts. Removing a contact does not delete its login account.
- Backend permissions always enforce access. Hiding a button or adding a client guard is not sufficient authorization.

## Order lifecycle

- Statuses: 1=pending, 2=processing, 3=rejected, 4=completed. Allowed transitions: 1 -> 2/3; 2 -> 3/4. Completed/rejected orders are terminal.
- Staff can use PATCH /orders/:id/start for eligible unassigned/own pending orders. Admin chooses an active staff handler. Backend enforces a maximum of five active orders per handler.
- Staff may complete/reject only their assigned open orders; rejection requires a trimmed cancellationReason, maximum 1000 characters. Admin may reject without a reason. Only admin may delete rejected orders or reassign staff.
- Backend controls totals, prices, discount snapshots, reservation and stock restoration. Never trust a client-calculated order total.
- Preserve historical customer/product/variant snapshots when related records change or disappear. Do not rewrite order history from the current catalog.
- Status mutations invalidate orders. Rejection also invalidates products because stock is restored.

## Product editing and pagination

- Product administration supports product-level SKU/barcode, VND currency, tags (up to 30, each 1–50 characters), weight in kg, complete width/height/depth in cm, warranty/shipping/return text (up to 2000 characters) and minimum order quantity. Missing model years remain optional; nullable fields can be cleared explicitly. Import provenance and source images are read-only.
- Administrative product detail reads GET /products/:id/metrics and paginated GET /products/:id/reviews separately. Rating/reviewCount are computed from reviews; soldCount counts units in completed orders. Admin may add/delete reviews; staff may only read. Review creation uses rating 1–5, reviewerName and comment, with source assigned by Backend. Review mutations invalidate both review pages and metrics. Preserve review drafts on failure and confirm deletion.
- Storefront detail reads public `/products/public/:slug/metrics` and paginated `/products/public/:slug/reviews` separately. Reviews retain source attribution; do not label them verified purchases. Anyone may submit via POST `/products/public/:slug/reviews`: integer rating 1-5, required trimmed reviewerName (1-100) and comment (1-2000), optional validated email/phone. Backend assigns source=storefront and the current date; strict validation rejects source/date/product overrides. Contact fields use select:false and are omitted from all public responses. Creation rechecks product/catalog visibility in the existing relations transaction. Requests are limited to five per IP per 15 minutes per API process. UI places the write-review button below comments and pagination, opens a two-step modal (choose stars, then form) without uploads, preserves drafts on failure, and refreshes reviews/metrics after success. Public review pages have five entries at most; metrics include ratingDistribution counts for each star across all reviews, independently of pagination. Show average, total and percentages; positive count means 4-5-star reviews, not unique or verified customers. Mutations invalidate the products prefix across public/admin views. Public `/products/public/:slug/related` returns up to five active products with active category/brand references, matching the same category only; tags alone do not qualify. Exclude the viewed product and order newest first with stable ID ordering. Missing/unpublished source products return 404 for all three endpoints. UI shows only the assigned category (root or child) below the product title, followed by the brand name; tags appear at the bottom of the description. Breadcrumb is Home / assigned category / product name, with category linking to its catalog filter; preserve list filters via the separate back link, delivery/warranty/returns inside the overview, vertical specification table excluding duplicate delivery/warranty/return rows, capitalized attribute labels, rating/reviews and a bottom “Các sản phẩm liên quan” section. Product detail has no news sidebar. Do not fabricate news API data, ratings, sales or reviews when requests fail.
- New products require valid active category/brand references. Legacy products may have missing references. Allow unrelated partial metadata edits without forcing replacement references or sending empty IDs; validate any newly selected reference.
- Submit only changed metadata. Preserve existing slug when updating a name unless a slug change is explicitly intended.
- Inventory/variant mutations require the version read with the original data. Do not silently upgrade the version of a stale draft to bypass optimistic concurrency.
- Product descriptions must be sanitized before rendering HTML. Retain typed variant options and persisted variant IDs.
- Catalog mutations invalidate both their own lists and populated products. Distinguish management cache shapes from catalog select lists.
- Pagination displays first/last pages and one neighbor on each side of the current page, with gaps. At page 10/10 the buttons are 1, gap, 9, 10. Tests must follow this agreed behavior.
- Preserve list URL filters and pagination when navigating into/out of product detail/edit pages.

## Loading and entry route

- The entry URL / renders storefront home. Initial auth-bootstrap and router hydration choose the skeleton by matching the real route hierarchy and its handle.area metadata. /dashboard and other admin routes use PageSkeleton; /, /contact, /register and /account routes use StoreSkeleton. Respect VITE_BASENAME during bootstrap; never choose the skeleton from the current user role.
- ProtectedRoute and PublicOnlyRoute pass their storefront flag explicitly when showing a loading fallback. Admin guards retain the admin skeleton; customer guards use the storefront skeleton.
- StoreSkeleton must not depend on router/session hooks, because it also renders before RouterProvider.

## Authentication and customer account

- Storefront login /account/login accepts only customers; admin/staff receive an error without publishing a frontend session, and the issued cookie session is revoked. Existing admin/staff sessions opening storefront auth pages see an error and never redirect to admin automatically. Customer login returns to /, with mandatory password changes taking precedence. Administrative /login retains role-based redirects and a valid requested admin destination when present.

- Access tokens stay in memory; refresh tokens use HttpOnly cookies. Persist only a non-secret session marker. Never persist passwords/tokens in browser storage or expose them in responses/logs.
- Reuse the shared refresh/session implementation and sessionVersion checks; clear query cache when identity changes or the user logs out.
- /account and all its children require role=customer. Guests go to /account/login with their original location retained; admin/staff sessions receive 403. Admin routes reject customers.
- Customer profile uses GET/PATCH /auth/me with the same strict profile schema as backend. Account email and role are read-only. personalEmail is an optional contact email, not the login email. Profile save refreshes the shared session user and profile cache.
- New passwords require 6-1024 characters, an uppercase letter, a digit and a non-whitespace special character; confirmation must match and new/current passwords must differ. Existing login/demo passwords remain valid under the login schema.
- Successful password changes revoke sessions. Clear frontend auth/cache and return customers to /account/login, admin/staff to /login.
- mustChangePassword routes customers to /account/change-password and staff/admin to /change-password.
- Storefront header links customer names to /account/profile. The admin navigation item is Trang Bán hàng and opens / (storefront home) in a new tab with noopener noreferrer.

## Deliberately unfinished areas

- Storefront category navigation reads GET /categories/public without authentication. Only active, non-deleted categories and public fields (_id, name, slug, icon, parent) are returned. Administrative endpoints remain protected. Store catalog filters accept category IDs; existing marketing links using category names/slugs resolve through this public category list.

- Storefront `/shop` and `/shop/:slug` read live Backend products via GET `/products/public` (paginated search, category and sorting) and GET `/products/public/:slug`. Home featured products and product menu also use this API, without authentication or staff permissions. Only active products with active, non-deleted category/brand references are public. Public responses use an explicit field allowlist and omit import provenance, image storage IDs and version fields. Products Admin links active products to their `/shop/:slug` detail in a new tab with noopener noreferrer. Public product queries share the `products` cache prefix so admin mutations invalidate them; other tabs refresh through the existing business-change sync. Cart and checkout remain unfinished; never fabricate a successful purchase.
- Customer account orders and addresses remain previews. Guard them, but do not fabricate successful API operations or claim they display live customer-owned records.
- Administrative customer editing is outside this task. Do not describe a disconnected update hook as working UI.

## Agent workflow

- Inspect current code, local instructions, git status and backend contract before editing. Do not overwrite unrelated user changes.
- Explain the plan for complex work. Keep the requested scope focused. No production data mutations, destructive operations, commits or pushes without authorization.
- Update this file when an authorized business rule changes; keep docs/frontend-structure.md consistent with implemented behavior.
