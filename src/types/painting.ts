import type { PagedQuery } from "./common";
import type { Tag } from "./tag";

export interface PaintingSize {
  id: number;
  label: string;
  widthCm: number;
  heightCm: number;
  price: number;
  finalPrice: number;
  discountAmount: number;
  sku: string | null;
  isDefault: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface PaintingImage {
  id: number;
  thumbnailPath: string;
  /** Watermarked variant — the only full-size image exposed publicly. */
  watermarkPath: string;
  /** Resized, non-watermarked variant — admin use only (e.g. slideshow selection). */
  resizedPath: string;
  isPrimary: boolean;
  displayOrder: number;
  width: number;
  height: number;
}

export interface PaintingListItem {
  id: number;
  code: string;
  name: string;
  slug: string;
  categoryId: number;
  categoryName: string | null;
  thumbnailPath: string | null;
  fromPrice: number;
  fromFinalPrice: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CompatibleFrame {
  id: number;
  name: string;
  material: string;
  color: string;
  thumbnailPath: string | null;
  basePrice: number;
  finalPrice: number;
}

export interface PaintingDetail {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  context: string | null;
  colors: string[];
  categoryId: number;
  categoryName: string | null;
  categorySlug: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  sizes: PaintingSize[];
  images: PaintingImage[];
  tags: Tag[];
  compatibleFrames: CompatibleFrame[];
}

export interface PaintingSizeInput {
  id?: number;
  label: string;
  widthCm: number;
  heightCm: number;
  price: number;
  sku?: string;
  isDefault: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface CreatePaintingRequest {
  code?: string;
  name: string;
  slug?: string;
  description?: string;
  context?: string;
  colors?: string[];
  categoryId: number;
  isPublished: boolean;
  isFeatured: boolean;
  sizes: PaintingSizeInput[];
  tagIds?: number[];
  compatibleFrameIds?: number[];
}

export type UpdatePaintingRequest = CreatePaintingRequest;

export interface PaintingQuery extends PagedQuery {
  categoryId?: number;
  categorySlug?: string;
  tagId?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
}
