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
- Customer login accounts in User are separate from Customer contact records used for administrative orders. Do not automatically link them by email or expose contact/order records without an explicit ownership design.
- /users lists admin/staff accounts, excluding customer accounts. Customer registration must not grant access to staff API endpoints.
- Backend permissions always enforce access. Hiding a button or adding a client guard is not sufficient authorization.

## Order lifecycle

- Statuses: 1=pending, 2=processing, 3=rejected, 4=completed. Allowed transitions: 1 -> 2/3; 2 -> 3/4. Completed/rejected orders are terminal.
- Staff can use PATCH /orders/:id/start for eligible unassigned/own pending orders. Admin chooses an active staff handler. Backend enforces a maximum of five active orders per handler.
- Staff may complete/reject only their assigned open orders; rejection requires a trimmed cancellationReason, maximum 1000 characters. Admin may reject without a reason. Only admin may delete rejected orders or reassign staff.
- Backend controls totals, prices, discount snapshots, reservation and stock restoration. Never trust a client-calculated order total.
- Preserve historical customer/product/variant snapshots when related records change or disappear. Do not rewrite order history from the current catalog.
- Status mutations invalidate orders. Rejection also invalidates products because stock is restored.

## Product editing and pagination

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

- Access tokens stay in memory; refresh tokens use HttpOnly cookies. Persist only a non-secret session marker. Never persist passwords/tokens in browser storage or expose them in responses/logs.
- Reuse the shared refresh/session implementation and sessionVersion checks; clear query cache when identity changes or the user logs out.
- /account and all its children require role=customer. Guests go to /account/login with their original location retained; admin/staff sessions receive 403. Admin routes reject customers.
- Customer profile uses GET/PATCH /auth/me with the same strict profile schema as backend. Account email and role are read-only. personalEmail is an optional contact email, not the login email. Profile save refreshes the shared session user and profile cache.
- New passwords require 6-1024 characters, an uppercase letter, a digit and a non-whitespace special character; confirmation must match and new/current passwords must differ. Existing login/demo passwords remain valid under the login schema.
- Successful password changes revoke sessions. Clear frontend auth/cache and return customers to /account/login, admin/staff to /login.
- mustChangePassword routes customers to /account/change-password and staff/admin to /change-password.
- Storefront header links customer names to /account/profile. The admin navigation item is Trang Bán hàng and links to / (storefront home), not /landing.

## Deliberately unfinished areas

- Storefront product search/catalog, cart and checkout are not implemented by this task. /shop is still not registered; do not report it as functional.
- Customer account orders and addresses remain previews. Guard them, but do not fabricate successful API operations or claim they display live customer-owned records.
- Administrative customer editing is outside this task. Do not describe a disconnected update hook as working UI.

## Agent workflow

- Inspect current code, local instructions, git status and backend contract before editing. Do not overwrite unrelated user changes.
- Explain the plan for complex work. Keep the requested scope focused. No production data mutations, destructive operations, commits or pushes without authorization.
- Update this file when an authorized business rule changes; keep docs/frontend-structure.md consistent with implemented behavior.
