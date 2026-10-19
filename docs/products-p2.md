# Products P2

## Configuration

Frontend and Backend must both include the Products P2 changes. Restart the Backend after rebuilding.

Set these variables in the Backend's local `.env` or deployment secret manager (never commit their values):

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_PRODUCT_FOLDER=project-final/products
```

Use the Cloudinary console to obtain the credentials. The Frontend never receives the API secret and never uploads directly using an unsigned preset.

## Images

Create a product, open its detail page as an admin, select an image, then choose **Upload image**. The server accepts one multipart field named `image`: JPG/PNG/WebP, at most 5 MiB, with a maximum of eight gallery images. The server validates file signatures and stores Cloudinary metadata. The first uploaded image becomes the thumbnail when the product has none.

Deletion requires confirmation. The server only deletes images belonging to that product and rejects gallery deletion while a variant still references the URL. Removing the current thumbnail selects the first remaining gallery image or clears it. A storage cleanup failure after successful database unlinking returns `cleanupPending: true`; the UI reports that administrator attention is needed. Storage and MongoDB operations are not a distributed transaction.

## Description

The editor uses `react-quill-new` (Quill 2 / React 19 support), with headings, emphasis, lists, blockquotes and links. Images remain separate from description. Plain-text descriptions remain supported, and HTML is sanitized with DOMPurify before editing and rendering. Existing descriptions are not rewritten just by opening the form. Backend's existing 2,000-character string limit includes HTML markup; the form displays a count and validation errors.

## API additions

The Admin list currently displays name, Category, Brand and Stock filters. Other query capabilities remain available in the service and Backend for storefront use. Stock uses total product inventory: `stockStatus=in_stock` (>0, including low stock), `low_stock` (1–5), or `out_of_stock` (0); omit it for all products.

- `GET /api/v1/products`: supports `search` (product name), `category`, `brand`, inclusive `minPrice`/`maxPrice`, `sortBy` (`product_name`, `price`, `createdAt`) and `sortOrder` (`asc`, `desc`), in addition to the existing variant filters and pagination.
- Prices are the product's stored price before discount. Variant SKU/color/size filters must match the same variant. Sorting defaults to newest first with `_id` as a stable tie breaker.
- `GET /api/v1/products/statistics`: `{ data: { total, active, outOfStock, stockUnits } }` for the entire catalog, independent of filters and pagination.
- `POST /api/v1/products/:id/images`: existing authenticated Cloudinary upload endpoint.
- `DELETE /api/v1/products/:id/images/:publicId`: authenticated gallery removal; URL-encode the complete Cloudinary public ID, including slashes.

## Manual verification

1. Set the Cloudinary variables, run Backend and Frontend, and sign in as an admin.
2. Add/edit a formatted description; save and confirm it displays correctly in detail. Verify a legacy plain-text description still works.
3. Upload a valid image and verify the gallery and thumbnail after reloading. Try an invalid type, oversized file and a full gallery.
4. Cancel and confirm image deletion; verify variant references prevent deletion and staff cannot upload/delete.
5. Combine name/catalog/variant/price filters, change sorting and page size, and revisit the URL. Verify statistics remain global.
6. Recheck existing CRUD, unsaved-change confirmation and inventory conflict handling.

Automated media tests mock Cloudinary and MongoDB; they do not prove that external credentials, networking or a deployed database are configured.
