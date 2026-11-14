# AI integration

- AI administration shows Sonner success/error feedback for operating settings, activation/reconnection, audit clearing and embedding actions without inline success/error banners. Reindex success uses the shared mutation successMessage metadata; its errors use the shared mutation error handler to avoid duplicate toasts. Manual status refresh reports success; successful background polling remains silent. Storefront chat feedback is unchanged.

- Configuration history has a Super Admin-only clear button with inline confirmation and revision conflict checks. The action removes only configuration audit, returns pagination to page one, and preserves unsaved operating edits, keys, chat history and embedding versions. Conflicts refresh settings and require a fresh confirmation.

- Super Admin can explicitly activate/reconnect the assistant using an inline confirmation that explains provider quota usage. The button initializes/enables chat only after JSON and streaming checks succeed, preserves other settings, and refreshes admin status/history. It is unavailable during emergency stop or unsaved edits. Embedding activation remains a separate operation. Admin/Staff do not see this action; its backend endpoint enforces Super Admin authorization.

- The administration routing inventory always lists Gemini, Groq, OpenRouter and Cloudflare, including providers missing configuration or excluded from routing. Missing credentials/account IDs and exclusion are explicit states with no routing priority. Only fully configured, enabled providers enter runtime fallback; showing an inventory row does not activate it or test its credentials.

Implementation and deployment contract: [Backend AI module](../../project-final-197-BE/docs/AI_MODULE.md).

- Domain UI, HTTP calls, schemas, hooks and types live under `src/features/ai/`.
- StoreLayout owns the floating ChatWidget. It stays in the storefront color scope and resets when account identity changes. Minimize is separate from confirmed completion. History uses paginated owner-scoped API calls.
- Catalog includes an independent expandable smart search panel with explicit brand/category/price filters. Existing catalog filtering, badges, ordering and pagination remain unchanged.
- Product detail includes similar choices in a separate section after existing related products. Suggestions do not assign badges or claim sales rankings.
- AI routing is automatic across environment-configured Gemini, Groq, OpenRouter and Cloudflare. The admin page displays order/cooldowns but contains no credential editor, delete-key action or manual chat selection. Operating settings/audit and Gemini embedding version management remain. History and Socket.IO contracts are unchanged; partial streams are never joined with a second model. See Backend AI module for environment setup and legacy embedding handling.
- `/auth/ai` uses the existing Admin/Super Admin guard and backend ai:manage permission. It exposes operational state without provider secrets or chat transcripts.
- Guest history: 24h after completion. Customer turns: rolling 30 days from submission. Active chats end after one hour without a sent message. The server is authoritative; UI expiration timers refresh cached data.
- No AI credential is stored in localStorage/sessionStorage. Guest identity is an HttpOnly cookie; access tokens remain in the existing in-memory auth store. Socket tickets are single-use and ephemeral.
- Chat transport uses socket.io-client and native named Socket.IO events. Ticket/accessToken are passed through handshake auth, never URL query parameters. Each turn connects with a new ticket; automatic reconnect/retry is disabled to prevent duplicate AI calls. The backend uses socket.io; no application module imports ws or constructs a native WebSocket.
- Provider configuration and actual vector-search provisioning are deployment prerequisites; normal storefront shopping still works without AI.
- Private chat calls wait for a serialized POST /ai/session bootstrap; public search/recommendations never initialize guest identity. The browser's Web Locks API coordinates tabs where available; other browsers serialize within one tab. AI HTTP reads use a 75-second timeout, with server-side cancellation/deadline support.
- Completion invalidates only conversation/history queries. Product cards are rendered per saved turn, using current backend visibility/prices; pagination reuses bounded server intent/embedding caches instead of refreshing unrelated AI panels.
- Stop cancels session preparation, conversation/ticket requests, socket connection and accepted streams. Cancelling one caller does not interrupt another caller's shared session bootstrap. Late events from cancelled turns are ignored. Draft text clears only after server acceptance and only if the user has not edited it. Ending a conversation disables sends for that conversation; its late response cannot clear a newly selected chat. Saved cards use immutable product IDs; legacy slug-only records show the transcript without guessing product identity.

Run `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd test`, `pnpm.cmd test:contracts`, `pnpm.cmd build`. Live provider/vector/hosting/browser acceptance is separate from automated tests.

- Provider attempt counters are monitoring only, with no website daily/API/provider budget or indexing 25% share. Anti-spam, token sizes, deadlines and upstream quota cooldowns remain. Model names have backend defaults; environment model variables are optional overrides. Legacy dailyCalls configuration is ignored.

- All AI administration result notifications use Sonner only. Emergency stop, stale configuration confirmations and pending worker notices use stable toast IDs to avoid repeat notifications on polling. Keep confirmation controls, loading indicators, form help, status badges and historical failure records as page content; do not restore inline operation-result banners. Query/mutation API errors continue through the shared toast handler where applicable. Storefront chat behavior remains separate.
