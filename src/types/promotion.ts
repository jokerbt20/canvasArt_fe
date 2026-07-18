import type { PagedQuery } from "./common";

export type PromotionType = "Painting" | "Frame" | "Combination";
export type DiscountType = "Percentage" | "FixedAmount";

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  targetPaintingId: number | null;
  targetFrameId: number | null;
  targetCategoryId: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrentlyActive: boolean;
  priority: number;
  createdAt: string;
}

export interface CreatePromotionRequest {
  name: string;
  description?: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  targetPaintingId?: number;
  targetFrameId?: number;
  targetCategoryId?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
}

export type UpdatePromotionRequest = CreatePromotionRequest;

export interface CombinationPromotion {
  id: number;
  name: string;
  description: string | null;
  paintingId: number;
  paintingName: string | null;
  frameId: number;
  frameName: string | null;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrentlyActive: boolean;
  priority: number;
  createdAt: string;
}

export interface CreateCombinationPromotionRequest {
  name: string;
  description?: string;
  paintingId: number;
  frameId: number;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
}

export type UpdateCombinationPromotionRequest = CreateCombinationPromotionRequest;

export interface PromotionQuery extends PagedQuery {
  promotionType?: PromotionType;
  isActive?: boolean;
  onlyCurrentlyActive?: boolean;
}
