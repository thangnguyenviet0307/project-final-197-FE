export interface HeroCategory { _id: string; name: string; icon?: string; isActive?: boolean; isDeleted?: boolean }
export interface HeroSlideInput { category: string; title: string; description: string; imageUrl: string | null; sortOrder: number; isActive: boolean }
export interface PublicHeroSlide { _id: string; category: HeroCategory; title: string; description: string; imageUrl: string | null; sortOrder: number }
export interface HeroSlide extends Omit<PublicHeroSlide, "category"> { category: HeroCategory | string | null; __v: number; isActive: boolean }
export interface HeroSlideUpdate { id: string; input: Partial<HeroSlideInput> & { expectedVersion: number } }
