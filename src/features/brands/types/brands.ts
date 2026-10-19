import type { CatalogReference } from "@/features/products/types/products"
export interface Brand extends CatalogReference { slug: string; description?: string; logoUrl?: string }
