# Frontend architecture

This document describes the current application. Detailed business rules and verification commands live in [PROJECT_RULES.md](../PROJECT_RULES.md); the sibling Backend defines the API contract.

## Responsibilities

- `router/`: routes, permission guards and separate Admin/Customer session bootstrap.
- `pages/admin/`: dashboard, catalog, inventory, orders, users, customers, profile, hero, articles and post categories.
- `pages/storefront/`: home, shop, product detail, cart, checkout, account, news/blog catalog and article detail.
- `features/<domain>/`: components, hooks, services, schemas, types and utils for each domain. Pages compose screens; hooks own queries/mutations/cache; services own HTTP; schemas validate input.
- `components/`, `hooks/`, `utils/`, `types/`: shared UI, logic and contracts. `layout/admin/` and `layout/storefront/` contain the page shells.
- `stores/`: Zustand session/cart state. `services/`: HTTP, refresh and query clients. Local drafts remain in component state.
- `public/`: static URL assets; `src/assets/`: Vite-managed imports. `tests/` and `docs/` live at the repository root.

## Current behavior

Cart persistence uses `storefront-cart-v2:guest` or `storefront-cart-v2:customer:<encoded-id>`. Login switches identities without merging guest or legacy v1 carts. Immutable operation journals synchronize matching identities across same-origin tabs. Failed writes remain queued in memory; those pending writes cannot survive closing the tab while storage is unavailable. There is no server cart or cross-device synchronization. Entering cart resets purchase selection. Quantity controls, variant selection and bulk deletion preserve unselected lines and respect loaded stock/minimum quantities.

COD checkout is implemented for authenticated Customers through `/customer-auth/orders` and guests through `/storefront/checkout`. Backend validates current prices, stock and legacy locality hierarchy, then reserves stock and creates an order/receipt atomically. Uncertain requests persist in identity-scoped sessionStorage and require an explicit retry with the same requestId/body. Draft/cart data survives request failures; only confirmed purchased quantities are subtracted. Guest checkout never creates or links accounts. Online payment is unfinished.

Unreadable/invalid pending storage blocks new checkout with an explicit recovery action; it is never treated as empty or overwritten. New unassigned guest Pending reservations expire after 24 hours under the approved policy, with transactional stock restoration. An expired receipt returns a definitive 409 and retains the cart for review; it cannot create a replacement order. Accepted orders and historical guest orders without a deadline are excluded.

Account profile, address and history use `/customer-auth/me`, `/customer-auth/shipping-address` and `/customer-auth/orders`. Customers cancel only their own Pending orders with a reason. Administrative customer management lists self-registered accounts and cannot create Customers. Staff/Admin/Super Admin permissions are also enforced by Backend.

Public catalog reads live API products with active product/brand/category references. Stopped or exhausted products remain visible but cannot be ordered. Explore links to `/shop`. Home uses API hero slides, Home/New/Featured carousels, a separate Best Seller section and explicitly featured public news. Removed landing, template and fake settings pages stay removed.

News/blog lists use `/articles/public?summary=true`, omitting content; detail fetches the full body and renders plain text. A successful article navigation records one view, including cached navigation; rerenders/refetch/StrictMode replay do not add views. Failed writes are not retried or allowed to block reading. Article title, description and canonical metadata follow the loaded article and restore previous head state on exit. This is SPA metadata, without SSR/prerender guarantees.

Article and category editor sessions protect dirty drafts on close, route navigation and unload. Background data never upgrades the original version or replaces drafts. Conflicts require explicit reload/review. Article/product lists recover an out-of-range page with URL replacement only after a settled successful current response, preserving filters. Article search inputs follow applied URL changes and retain drafts during refetch.

VND displays use up to two fraction digits across cards/detail/checkout. Existing half-up per-line arithmetic remains authoritative. Queries do not poll: mutations invalidate caches and use same-origin cross-tab signals; navigation/focus/reconnect/manual refresh revalidate remote changes.

Footer links target implemented routes. Contact/newsletter disclose preview-only submission. Storefront sections share `store-container` alignment. `vercel.json` rewrites SPA paths to `/index.html`; direct entry and refresh need hosting acceptance checks.

## Verification

Use pnpm exclusively: `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd test`, `pnpm.cmd test:contracts`, `pnpm.cmd build`. Contract checks read sibling Backend schemas without database access. Unit/build success does not prove browser, production database or hosting behavior.
