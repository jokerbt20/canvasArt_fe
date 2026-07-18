import type { PagedQuery } from "./common";

export interface FrameSize {
  id: number;
  label: string;
  widthCm: number;
  heightCm: number;
  price: number;
  finalPrice: number;
  discountAmount: number;
  stock: number;
  sku: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface FrameListItem {
  id: number;
  code: string;
  name: string;
  material: string;
  color: string;
  thumbnailPath: string | null;
  basePrice: number;
  finalPrice: number;
  stock: number;
  isActive: boolean;
}

export interface FrameDetail {
  id: number;
  code: string;
  name: string;
  material: string;
  color: string;
  description: string | null;
  imagePath: string | null;
  thumbnailPath: string | null;
  basePrice: number;
  finalPrice: number;
  discountAmount: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  sizes: FrameSize[];
}

export interface FrameSizeInput {
  id?: number;
  label: string;
  widthCm: number;
  heightCm: number;
  price: number;
  stock: number;
  sku?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateFrameRequest {
  code?: string;
  name: string;
  material: string;
  color: string;
  description?: string;
  basePrice: number;
  stock: number;
  isActive: boolean;
  sizes: FrameSizeInput[];
}

export type UpdateFrameRequest = Omit<CreateFrameRequest, "code">;

export interface FrameQuery extends PagedQuery {
  material?: string;
  color?: string;
  isActive?: boolean;
  compatibleWithPaintingId?: number;
}
