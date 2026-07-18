import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  CombinationPromotion,
  CreateCombinationPromotionRequest,
  CreatePromotionRequest,
  PagedResult,
  Promotion,
  PromotionQuery,
  UpdateCombinationPromotionRequest,
  UpdatePromotionRequest,
} from "../types";

export const promotionService = {
  list: async (query: PromotionQuery): Promise<PagedResult<Promotion>> => {
    const { data } = await apiClient.get<PagedResult<Promotion>>(endpoints.promotions.list, {
      params: query,
    });
    return data;
  },

  create: async (payload: CreatePromotionRequest): Promise<Promotion> => {
    const { data } = await apiClient.post<Promotion>(endpoints.promotions.list, payload);
    return data;
  },

  update: async (id: number, payload: UpdatePromotionRequest): Promise<Promotion> => {
    const { data } = await apiClient.put<Promotion>(endpoints.promotions.byId(id), payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.promotions.byId(id));
  },

  listCombinations: async (query: PromotionQuery): Promise<PagedResult<CombinationPromotion>> => {
    const { data } = await apiClient.get<PagedResult<CombinationPromotion>>(
      endpoints.promotions.combinations,
      { params: query },
    );
    return data;
  },

  createCombination: async (
    payload: CreateCombinationPromotionRequest,
  ): Promise<CombinationPromotion> => {
    const { data } = await apiClient.post<CombinationPromotion>(
      endpoints.promotions.combinations,
      payload,
    );
    return data;
  },

  updateCombination: async (
    id: number,
    payload: UpdateCombinationPromotionRequest,
  ): Promise<CombinationPromotion> => {
    const { data } = await apiClient.put<CombinationPromotion>(
      endpoints.promotions.combinationById(id),
      payload,
    );
    return data;
  },

  removeCombination: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.promotions.combinationById(id));
  },
};
