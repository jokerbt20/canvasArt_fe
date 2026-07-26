import type { PagedQuery } from "./common";

export interface FrameListItem {
  id: number;
  code: string;
  name: string;
  material: string;
  color: string;
  thumbnailPath: string | null;
  basePrice: number;
  finalPrice: number;
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
  isActive: boolean;
  createdAt: string;
}

export interface CreateFrameRequest {
  code?: string;
  name: string;
  material: string;
  color: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
}

export type UpdateFrameRequest = Omit<CreateFrameRequest, "code">;

export interface FrameQuery extends PagedQuery {
  material?: string;
  color?: string;
  isActive?: boolean;
  compatibleWithPaintingId?: number;
  hasImage?: boolean;
}
