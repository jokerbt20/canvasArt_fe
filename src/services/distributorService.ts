import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  ApplyPromoCodeRequest,
  CreateDistributorRequest,
  CreatePromoCodeRequest,
  Distributor,
  DistributorDashboardQuery,
  DistributorQuery,
  DistributorSalesRow,
  PagedResult,
  PromoCode,
  PromoCodeApplyResult,
  UpdateDistributorRequest,
  UpdatePromoCodeRequest,
} from "../types";

export const distributorService = {
  list: async (query: DistributorQuery): Promise<PagedResult<Distributor>> => {
    const { data } = await apiClient.get<PagedResult<Distributor>>(endpoints.distributors.list, {
      params: query,
    });
    return data;
  },

  getById: async (id: number): Promise<Distributor> => {
    const { data } = await apiClient.get<Distributor>(endpoints.distributors.byId(id));
    return data;
  },

  create: async (payload: CreateDistributorRequest): Promise<Distributor> => {
    const { data } = await apiClient.post<Distributor>(endpoints.distributors.list, payload);
    return data;
  },

  update: async (id: number, payload: UpdateDistributorRequest): Promise<Distributor> => {
    const { data } = await apiClient.put<Distributor>(endpoints.distributors.byId(id), payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.distributors.byId(id));
  },

  dashboard: async (query: DistributorDashboardQuery): Promise<DistributorSalesRow[]> => {
    const { data } = await apiClient.get<DistributorSalesRow[]>(endpoints.distributors.dashboard, {
      params: query,
    });
    return data;
  },

  promoCodes: async (distributorId: number): Promise<PromoCode[]> => {
    const { data } = await apiClient.get<PromoCode[]>(endpoints.distributors.promoCodes(distributorId));
    return data;
  },

  createPromoCode: async (payload: CreatePromoCodeRequest): Promise<PromoCode> => {
    const { data } = await apiClient.post<PromoCode>(endpoints.promoCodes.list, payload);
    return data;
  },

  updatePromoCode: async (id: number, payload: UpdatePromoCodeRequest): Promise<PromoCode> => {
    const { data } = await apiClient.put<PromoCode>(endpoints.promoCodes.byId(id), payload);
    return data;
  },

  removePromoCode: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.promoCodes.byId(id));
  },

  applyPromoCode: async (payload: ApplyPromoCodeRequest): Promise<PromoCodeApplyResult> => {
    const { data } = await apiClient.post<PromoCodeApplyResult>(endpoints.promoCodes.apply, payload);
    return data;
  },
};
