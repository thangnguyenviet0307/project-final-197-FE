import { create } from "zustand"
import { persist } from "zustand/middleware"

interface StoreState {
  cart: Record<string, number>
  wishlist: string[]
  addToCart: (slug: string, quantity?: number) => void
  setQuantity: (slug: string, quantity: number) => void
  toggleWishlist: (slug: string) => void
}
export const useStorefront = create<StoreState>()(persist((set) => ({
  cart: {}, wishlist: [],
  addToCart: (slug, quantity = 1) => set(state => ({ cart: { ...state.cart, [slug]: Math.min(99, (state.cart[slug] ?? 0) + Math.max(1, Math.floor(quantity))) } })),
  setQuantity: (slug, quantity) => set(state => {
    const cart = { ...state.cart }
    if (quantity <= 0) delete cart[slug]
    else if (Number.isFinite(quantity)) cart[slug] = Math.min(99, Math.floor(quantity))
    return { cart }
  }),
  toggleWishlist: slug => set(state => ({ wishlist: state.wishlist.includes(slug) ? state.wishlist.filter(id => id !== slug) : [...state.wishlist, slug] })),
}), { name: "amanto-storefront-demo", version: 1 }))
