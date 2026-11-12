import { expect, it } from 'vitest';
import { categorySchema } from '@/features/categories/schemas/category-schema';
import {
  articleInputSchema,
  categoryInputSchema,
} from '@/features/articles/schemas/article-schema';
import { heroSlideSchema } from '@/features/hero-slides/schemas/hero-slide-schema';
import { productSchema } from '@/features/products/schemas/product-schema';
import {
  createWarrantySchema,
  policyContentSchema,
} from '@/features/support/schemas/support-schema';
import { saveInformationSchema } from '@/features/support/schemas/information-schema';

it('accepts expanded descriptions and rejects overflow consistently across frontend modules', () => {
  const text = 'ệ'.repeat(100_000);
  for (const schema of [
    categorySchema.shape.description,
    categoryInputSchema.shape.description,
    heroSlideSchema.shape.description,
    articleInputSchema.shape.excerpt,
    createWarrantySchema.shape.description,
    productSchema.shape.warrantyInformation,
    productSchema.shape.shippingInformation,
    productSchema.shape.returnPolicy,
  ]) {
    expect(schema.safeParse(text).success).toBe(true);
    expect(schema.safeParse(text + 'x').success).toBe(false);
  }
});

it('permits million-character article/information content and hundred-thousand-character policy sections', () => {
  const long = 'ệ'.repeat(1_000_000);
  for (const schema of [
    articleInputSchema.shape.content,
    saveInformationSchema.shape.content,
  ]) {
    expect(schema.safeParse(long).success).toBe(true);
    expect(schema.safeParse(long + 'x').success).toBe(false);
  }
  for (const schema of Object.values(policyContentSchema.shape)) {
    expect(schema.safeParse('ệ'.repeat(100_000)).success).toBe(true);
    expect(schema.safeParse('ệ'.repeat(100_001)).success).toBe(false);
  }
});
