import { create } from "zustand"
import { persist } from "zustand/middleware"
import { cartKey, getProductOptions } from "./product-options"
import type { StoreProduct } from "./catalog"

interface StoreState {
  apiProducts: Record<string, StoreProduct>
  cacheProduct: (product: StoreProduct) => void
  cart: Record<string, number>
  wishlist: string[]
  addToCart: (slug: string, quantity?: number, option?: string) => void
  setQuantity: (slug: string, quantity: number) => void
  toggleWishlist: (slug: string) => void
}
export const useStorefront = create<StoreState>()(persist((set) => ({
  cart: {}, wishlist: [], apiProducts: {},
  cacheProduct: product => set(state => ({ apiProducts: { ...state.apiProducts, [product.slug]: product } })),
  addToCart: (slug, quantity = 1, option) => set(state => {
    if (!Number.isFinite(quantity)) return state
    const product = state.apiProducts[slug]
    if (product?.available === false) return state
    const options = product?.options ?? getProductOptions(slug)
    if (options.length && !option && product?.source === "api") return state
    if (option && !options.some(item => (item.id === option || item.name === option) && item.available)) return state
    const key = cartKey(slug, option)
    return { cart: { ...state.cart, [key]: Math.min(99, (state.cart[key] ?? 0) + Math.max(1, Math.floor(quantity))) } }
  }),
  setQuantity: (slug, quantity) => set(state => {
    const cart = { ...state.cart }
    if (quantity <= 0) delete cart[slug]
    else if (Number.isFinite(quantity)) cart[slug] = Math.min(99, Math.floor(quantity))
    return { cart }
  }),
  toggleWishlist: slug => set(state => ({ wishlist: state.wishlist.includes(slug) ? state.wishlist.filter(id => id !== slug) : [...state.wishlist, slug] })),
}), { name: "amanto-storefront-demo", version: 1 }))
