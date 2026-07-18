import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type { CartRequest, CartResponse } from "../types";

export const cartService = {
  calculate: async (payload: CartRequest): Promise<CartResponse> => {
    const { data } = await apiClient.post<CartResponse>(endpoints.cart.calculate, payload);
    return data;
  },
};
