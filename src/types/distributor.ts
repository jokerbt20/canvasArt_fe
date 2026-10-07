import type { PagedQuery } from "./common";

export interface Distributor {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  promoCodeCount: number;
  createdAt: string;
}

export interface CreateDistributorRequest {
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export type UpdateDistributorRequest = CreateDistributorRequest;

export interface DistributorQuery extends PagedQuery {
  isActive?: boolean;
}

export interface PromoCode {
  id: number;
  distributorId: number;
  distributorName: string | null;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  /** First valid day (ISO); null = immediately. */
  startsAt: string | null;
  /** Last valid day, inclusive (ISO); null = no end. */
  endsAt: string | null;
  /** Active and inside its window right now — what checkout accepts. */
  isCurrentlyValid: boolean;
  createdAt: string;
}

export interface CreatePromoCodeRequest {
  distributorId: number;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface UpdatePromoCodeRequest {
  code: string;
  discountPercentage: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface ApplyPromoCodeRequest {
  code: string;
}

export interface PromoCodeApplyResult {
  code: string;
  discountPercentage: number;
}

export interface DistributorDashboardQuery {
  fromDate?: string;
  toDate?: string;
}

export interface DistributorSalesRow {
  distributorId: number;
  distributorName: string;
  isActive: boolean;
  orderCount: number;
  totalSales: number;
  totalPromoDiscount: number;
}
