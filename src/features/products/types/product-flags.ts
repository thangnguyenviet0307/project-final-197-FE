import type { ProductFlag } from "@/features/products/types/products"

export const productFlags = [
  ["on_sale", "On sale"], ["is_best_seller", "Best Seller"], ["is_new", "New"], ["is_hot", "Hot"], ["is_home", "Home"],
] as const satisfies readonly (readonly [ProductFlag, string])[]
