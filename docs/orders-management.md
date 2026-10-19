# Order codes and search

- New orders receive an immutable code such as `ORD-A7K9M2`.
- Codes use six random uppercase letters/digits excluding `I`, `O`, `0`, `1`.
- A unique partial index prevents duplicate codes; creation retries the whole transaction on a code collision.
- MongoDB `_id` remains the identifier used in routes and API requests.
- Orders without a code display their original ID until backfilled. Reading an old order never generates a temporary code.
- `GET /api/v1/orders?search=...` searches codes case-insensitively, or customer phone numbers including common separators. Phone search prefers order snapshots; legacy orders without a phone snapshot fall back to the customer record.
- Search combines with status/date filters and respects the current user's order scope. Report cards retain totals across all filters.

## Backfill existing orders

Run in `project-final-197-BE`, using its configured `MONGODB_URI`. The development backfill was executed with user authorization: one order received a code and a subsequent dry run found zero missing codes.

```powershell
pnpm.cmd build
node scripts/backfill-order-codes.mjs
```

The default mode counts missing codes without writing data. After checking the target database and count:

```powershell
node scripts/backfill-order-codes.mjs --apply
```

Apply mode creates the unique index and assigns codes only to orders still missing one. It preserves existing codes, does not change prices/statuses/timestamps, and can be rerun after interruption. In production, run this deployment step before enabling new order creation, because automatic index creation is disabled there.

## Scheduling

`PATCH /api/v1/orders/:id/dates` accepts `requireDate`, `plannedShippingDate` and `shippingDate` as ISO timestamps. Unknown fields and empty bodies are rejected.

- Admin can reschedule Pending/Processing orders. Staff can reschedule only orders assigned to themselves.
- Required/planned dates can be cleared with `null`; dates cannot precede order creation.
- Date picker values use the end of the selected local day.
- `shippingDate` retains its existing meaning as the actual completion timestamp, displayed as **Completed at**. Only admin can correct it on a Completed order, between order creation and now.
- Rescheduling never changes status, item snapshots or monetary totals. Rejected orders cannot be edited.
