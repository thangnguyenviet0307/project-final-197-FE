# AI integration

Implementation and deployment contract: [Backend AI module](../../project-final-197-BE/docs/AI_MODULE.md).

- Domain UI, HTTP calls, schemas, hooks and types live under `src/features/ai/`.
- StoreLayout owns the floating ChatWidget. It stays in the storefront color scope and resets when account identity changes. Minimize is separate from confirmed completion. History uses paginated owner-scoped API calls.
- Catalog includes an independent expandable smart search panel with explicit brand/category/price filters. Existing catalog filtering, badges, ordering and pagination remain unchanged.
- Product detail includes similar choices in a separate section after existing related products. Suggestions do not assign badges or claim sales rankings.
- `/auth/ai` uses the existing Admin/Super Admin guard and backend ai:manage permission. It exposes operational state without provider secrets or chat transcripts.
- Guest history: 24h after completion. Customer turns: rolling 30 days from submission. Active chats end after one hour without a sent message. The server is authoritative; UI expiration timers refresh cached data.
- No AI credential is stored in localStorage/sessionStorage. Guest identity is an HttpOnly cookie; access tokens remain in the existing in-memory auth store. Socket tickets are single-use and ephemeral.
- Chat transport uses socket.io-client and native named Socket.IO events. Ticket/accessToken are passed through handshake auth, never URL query parameters. Each turn connects with a new ticket; automatic reconnect/retry is disabled to prevent duplicate AI calls. The backend uses socket.io; no application module imports ws or constructs a native WebSocket.
- Provider configuration and actual vector-search provisioning are deployment prerequisites; normal storefront shopping still works without AI.
- Private chat calls wait for a serialized POST /ai/session bootstrap; public search/recommendations never initialize guest identity. The browser's Web Locks API coordinates tabs where available; other browsers serialize within one tab. AI HTTP reads use a 75-second timeout, with server-side cancellation/deadline support.
- Completion invalidates only conversation/history queries. Product cards are rendered per saved turn, using current backend visibility/prices; pagination reuses bounded server intent/embedding caches instead of refreshing unrelated AI panels.
- Stop cancels session preparation, conversation/ticket requests, socket connection and accepted streams. Cancelling one caller does not interrupt another caller's shared session bootstrap. Late events from cancelled turns are ignored. Draft text clears only after server acceptance and only if the user has not edited it. Ending a conversation disables sends for that conversation; its late response cannot clear a newly selected chat. Saved cards use immutable product IDs; legacy slug-only records show the transcript without guessing product identity.

Run `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd test`, `pnpm.cmd test:contracts`, `pnpm.cmd build`. Live provider/vector/hosting/browser acceptance is separate from automated tests.
