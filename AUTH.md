# Authentication and user management

## Local setup

- Backend: sibling directory `../project-final-197-BE`. Start it with `pnpm dev` and its existing MongoDB/JWT configuration.
- Frontend `.env`: `VITE_API_BASE_URL=http://localhost:5000/api/v1`.
- Start Frontend with `pnpm dev` and open `/login`.
- For a subdirectory deployment, configure `VITE_BASENAME`.
- Never put JWT secrets, MongoDB credentials, or bootstrap secrets in `VITE_*` variables.

## Accounts and navigation

Admin provisions staff/admin accounts at `/users`. There is no public registration. Share temporary credentials privately. New accounts and password resets require a password change on first sign-in. Changing or resetting a password revokes previous sessions.

Creation uses `Admin123` for admin accounts and `Staff123` for staff accounts. Password reset forms generate a unique temporary password using the browser cryptographic random generator. Reset passwords remain stable while their dialog is open; share them privately. The creation form updates the temporary password when the selected role changes. The Users Full name column shows only saved first/last names and remains blank when no name is recorded.

Use the three-dot account menu at the bottom of the sidebar for User Profile, Change password, and Sign out. The avatar uses the saved image or initials. Upgrade to Pro, the Welcome promotion, Pricing, and Plans & Billing have been removed from dashboard navigation and the account menu. Old billing/pricing URLs redirect to Profile/Dashboard.

## Profile

User Profile (`/settings/user`) supports first/last name, personal email, phone, location, bio, and avatar. Account email and role are readonly and protected by the Backend. Save Changes updates the API, sidebar user, and cached Users list. Avatar files use multipart FormData: JPG/PNG/GIF up to 800 KB. Reset photo removes the saved image when submitted; Cancel discards unsaved changes.

Users includes account deletion with a warning popover and explicit confirmation. The UI prevents deleting the currently signed-in account. The Backend protects the last active administrator and accounts referenced by orders.

## API

All paths below follow `/api/v1`. Responses use `{ success, statusCode, message, data, errors? }`.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Email/password sign-in; returns user and both tokens |
| GET | `/auth/me` | Current user/profile and password-change requirement |
| PATCH | `/auth/me` | Update own profile using multipart FormData |
| POST | `/auth/refresh` | Rotate both tokens using `{ refreshToken }` |
| POST | `/auth/logout` | Revoke session |
| POST | `/auth/change-password` | Verify current password, set new password, revoke sessions |
| GET/POST | `/users` | Admin lists/provisions accounts |
| PUT | `/users/:id` | Admin updates account or sets temporary password |
| DELETE | `/users/:id` | Admin deletes account |

Zustand persists only access/refresh tokens. User and role are checked through `/me` after a reload. Axios attaches Bearer tokens, coalesces refresh requests within a tab, and retries failed requests once. Failed refresh clears credentials and private query cache. Backend currently supports admin/staff; customer roles cannot access the Dashboard.

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

- Frontend: `pnpm test`, `pnpm build`, `pnpm lint`.
- Backend: `pnpm test` from its own directory.
- Auth/profile tests use Axios adapters or mock Mongoose with temporary HTTP servers; they do not modify a real database.

Library reference: [Sonner](https://sonner.emilkowal.ski/getting-started).
