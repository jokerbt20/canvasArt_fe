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
  createdAt: string;
}

export interface CreatePromoCodeRequest {
  distributorId: number;
  code: string;
  discountPercentage: number;
  isActive: boolean;
}

export interface UpdatePromoCodeRequest {
  code: string;
  discountPercentage: number;
  isActive: boolean;
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
