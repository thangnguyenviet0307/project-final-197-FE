import type { CatalogReference } from "./products"
export interface Brand extends CatalogReference { slug: string; description?: string; logoUrl?: string }
