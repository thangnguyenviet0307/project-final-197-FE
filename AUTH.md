# Authentication and user management

## Local setup

- Backend: sibling directory `../project-final-197-BE`. Start it with `pnpm dev` and its existing MongoDB/JWT configuration.
- Frontend `.env`: `VITE_API_BASE_URL=http://localhost:5000/api/v1`.
- Start Frontend with `pnpm dev` and open `/login`.
- For a subdirectory deployment, configure `VITE_BASENAME`.
- Never put JWT secrets, MongoDB credentials, or bootstrap secrets in `VITE_*` variables.

## Accounts and navigation

Customer sign-in is available at `/account/login` inside the storefront and uses the existing cookie-based `/auth/login` API. Sign-in redirects by role: customer to `/`, admin/staff to the admin dashboard. Authenticated sessions opening sign-in/registration follow the same rule. A required password change takes precedence: customers go to `/account/change-password`, admin/staff to `/change-password`. Storefront sign-out returns to `/account/login`. `/login` remains the separate administration sign-in page.

`/register` validates customer names (1–50 characters), email, password and confirmation, then sends only firstName, lastName, email and password to `POST /auth/register`. Successful registration opens `/account/login` with a confirmation message and empty password field; it does not sign in automatically. Successful customer sign-in opens the storefront homepage `/`. Customer account pages remain previews.

Admin provisions staff/admin accounts at `/users`; public registration creates only customer accounts. Share temporary staff/admin credentials privately. Admin-provisioned accounts and password resets require a password change on first sign-in. Changing or resetting a password revokes previous sessions.

Public registration creates the customer User and a Customer contact atomically in a MongoDB transaction, linked by `Customer.accountId`. New registrations appear directly in the admin contact list and its statistics. Phone/address are initially blank. Existing contacts are never claimed by email; conflicts return 409. Earlier registrations are not backfilled automatically. Removing a contact does not remove its login account.

Creation uses `Admin123` for admin accounts and `Staff123` for staff accounts. Password reset forms generate a unique temporary password using the browser cryptographic random generator. Reset passwords remain stable while their dialog is open; share them privately. The creation form updates the temporary password when the selected role changes. The Users Full name column shows only saved first/last names and remains blank when no name is recorded.

Use the three-dot account menu at the bottom of the sidebar for User Profile, Change password, and Sign out. The avatar uses the saved image or initials. Upgrade to Pro, the Welcome promotion, Pricing, and Plans & Billing have been removed from dashboard navigation and the account menu. Old billing/pricing URLs redirect to Profile/Dashboard.

## Profile

User Profile (`/settings/user`) supports first/last name, personal email, phone, location, bio, and avatar. Account email and role are readonly and protected by the Backend. Save Changes updates the API, sidebar user, and cached Users list. Avatar files use multipart FormData: JPG/PNG/GIF up to 800 KB. Reset photo removes the saved image when submitted; Cancel discards unsaved changes.

Users includes account deletion with a warning popover and explicit confirmation. The UI prevents deleting the currently signed-in account. The Backend protects the last active administrator and accounts referenced by orders.

## API

All paths below follow `/api/v1`. Responses use `{ success, statusCode, message, data, errors? }`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Email/password sign-in; browser returns user/access token and sets refresh cookie |
| POST | `/auth/register` | Create customer account; return public user without signing in |
| GET | `/auth/me` | Current user/profile and password-change requirement |
| PATCH | `/auth/me` | Update own profile using multipart FormData |
| POST | `/auth/refresh` | Browser: rotate using HttpOnly cookie + custom transport header; non-browser: `{ refreshToken }` |
| POST | `/auth/logout` | Revoke session |
| POST | `/auth/change-password` | Verify current password, set new password, revoke sessions |
| GET/POST | `/users` | Admin lists/provisions accounts |
| PUT | `/users/:id` | Admin updates account or sets temporary password |
| DELETE | `/users/:id` | Admin deletes account |

Zustand persists only a non-secret session marker/ID. Access tokens stay in memory; the browser refresh token stays in an HttpOnly cookie. User and role are checked through `/me` after a reload. Axios attaches Bearer tokens, coalesces refresh requests within a tab, uses Web Locks across tabs where supported, and retries failed requests once. Rejected refresh clears credentials and private query cache; network/server failures remain retryable. Backend currently supports admin/staff; customer roles cannot access the Dashboard.

## Notifications and language

Sonner displays dismissible success/error notifications at the bottom-left, respecting the app theme. Query and mutation failures use shared error formatting. Successful sign-in/out, profile saves, account creation/deletion, and password changes/resets show action-specific messages. Inline field errors remain available next to the relevant inputs. Frontend interface text is English; known localized Backend errors are translated, while unrecognized Backend messages are preserved rather than replaced with a generic status message.

Notifications use a compact 280px responsive width, 10px horizontal padding, centered text, and no close button. They expire after five seconds and stack up to three at once. Older notifications are dismissed when a burst exceeds the limit, preventing an unbounded pending queue. Hovering or interacting with notifications temporarily pauses Sonner's expiry timer.

## Frontend code organization

- `src/services/api.ts`: shared HTTP client and refresh handling.
- `src/features/auth/`: auth services, schemas, mutations, and session initialization.
- `src/stores/auth.store.ts`: shared Zustand session store.
- `src/context/`: theme/sidebar contexts and theme provider.
- `src/layout/`: root layout and admin shell.
- `src/features/profile/`: profile queries, cache updates, and local avatar validation/preview.
- `src/features/users/`: user services, queries/mutations, confirmation UI, and list cache invalidation.
- `src/hooks/theme/`: theme state, customization, and theme transitions.
- `src/hooks/layout/`: responsive layout, fullscreen, and sidebar configuration.
- Pages/components render the interface, validate form input, and map API errors to fields. Hooks accept callbacks for form-specific success/error handling.
- `src/types/mutation.ts`: shared TypeScript callback types for mutation hooks.
- `src/router/`: route definitions, access guards, and auth bootstrap.
- See [Frontend structure](docs/frontend-structure.md) for page locations and rules for new commerce features.

## Verification commands

- Frontend: `pnpm typecheck` (app and tests), `pnpm test`, `pnpm build`, `pnpm lint`.
- Backend: `pnpm test` from its own directory.
- Auth/profile tests use Axios adapters or mock Mongoose with temporary HTTP servers; they do not modify a real database.

Library reference: [Sonner](https://sonner.emilkowal.ski/getting-started).

## Browser session transport

The Admin frontend sends `X-Auth-Transport: cookie` for login/refresh and enables credentials. Backend sets an HttpOnly, SameSite=Strict refresh cookie scoped to `/api/v1/auth`; production adds Secure. Access tokens remain in memory. Local storage contains only a session marker, never tokens. Old persisted credentials are discarded on upgrade; sign in again.

Backend `FRONTEND_ORIGINS` is a comma-separated exact origin allowlist (default local origins: http://localhost:5173 and http://127.0.0.1:5173). Production requires an explicit allowlist and HTTPS. Keep FE/API on the same site for SameSite=Strict, or deploy an API reverse proxy; cross-site deployments need a separate cookie/CSRF design. Browser refresh requires the custom header and trusted Origin. Non-browser REST clients can retain the JSON token contract without Origin. No .env files are changed automatically.

Demo creation passwords remain Admin123/Staff123 by explicit decision; mandatory first-password change remains enabled. These shared defaults are an accepted demo limitation and must be reconsidered before production.

## Admin and Staff permissions

Admin retains all existing management permissions. Staff may view all order history and details at every status, including other handlers' orders, and create manual orders assigned to themselves. Staff may accept eligible unassigned Pending orders, update status and cancellation reasons, and edit notes/delivery schedules on their own open orders. Orders assigned to another handler remain read-only; reassignment and permanent deletion remain Admin-only. Each Staff may hold up to five active (Pending or Processing) orders, enforced transactionally on create, acceptance, status assignment and Admin reassignment. Completed and Rejected orders free capacity. Cancellation uses the existing Rejected status, preserves the order, and restores inventory transactionally. Only Admin may permanently delete rejected orders or reassign handlers.

Staff may view products and update inventory through `PATCH /products/:id/inventory`. This strict endpoint accepts only an expected product version and product stock or variant IDs/stocks; prices, discounts, product creation/deletion and image management remain Admin-only. Existing product SKU lookup remains available.

Staff may view/create customers and inspect their accessible order history using the customer filter. Customer editing/deletion and account management remain Admin-only. No customer export endpoint or Staff export control is provided. This restricts built-in export, not the ability to copy information a user can already view.

The Staff Dashboard shows personal all-time completed sales through `GET /orders/personal-sales`, scoped on the server to the authenticated account, plus operational order and inventory counts. Personal sales exclude unassigned orders and other handlers' orders. The system has no shift tracking, cost/profit or cash-flow module; shift revenue is not inferred. Order statuses remain Pending, Processing, Rejected and Completed.
