# Product detail

Route: `/:categorySlug/:slug`, using `category.slug` and `product.slug` from the public API.

## UI

The desktop layout follows the supplied screenshots: vertical thumbnails and square gallery on the left, purchase summary in the middle, and three bordered policy cards on the right. The complete frame is centered at 92% viewport width (maximum 2160px); desktop columns, typography and controls scale proportionally with the viewport. Latest/Upsell collections use four cards per desktop row, two on smaller screens.

A fixed bottom purchase summary appears once the shared navbar scrolls above the viewport, and hides when the navbar returns. It shares the selected variant, quantity and cart actions with the main summary. The installment button opens a contact dialog; no financing application is submitted.

- Tailwind CSS handles grid/flex layouts, spacing and responsive utility classes.
- Existing shadcn UI components: Button, Input, Tabs and Dialog.
- lucide-react provides navigation, quantity, zoom, cart and share icons.
- `product-detail.css` keeps the reference-specific geometry, typography, colors and component states scoped to this template.
- The shared header is styled for this product template without changing its routing or API behavior.

## Data and interactions

- Detail: `GET /api/v1/storefront/products/:slug`.
- Product carousels: `GET /api/v1/storefront/products/:slug/recommendations`, returning only published products with active category/brand references. Existing safe DTO mapping is reused.
- The description uses the actual API data and existing DOMPurify sanitization. Review/video are not fabricated when absent.
- Thumbnails come from the unique images of all API variants, so their number follows the variant data. If no variant has images, the gallery falls back to product images.
- Color/variant changes update image and price. Clicking thumbnails or gallery arrows only changes the preview; selected color, price and cart variant stay unchanged. Cart entries preserve variant IDs.
- Image errors fall back to the product thumbnail and then a neutral placeholder.
- Buy it now adds the selected item and opens the cart; payment/checkout is not connected.

Reference: https://amanto-store-demo.myshopify.com/products/blue-silence

Verification: `npm.cmd run build`, `npm.cmd test` (280 tests), scoped ESLint. Browser checks at 1440px and 390px: no horizontal overflow, purchase bar hidden initially, visible after navbar passes, hidden again on return to top.
