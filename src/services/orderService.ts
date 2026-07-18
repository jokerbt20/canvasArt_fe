import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  CreateOrderRequest,
  OrderDetail,
  OrderListItem,
  OrderQuery,
  OrderStats,
  PagedResult,
  UpdateOrderStatusRequest,
} from "../types";

export const orderService = {
  create: async (payload: CreateOrderRequest): Promise<OrderDetail> => {
    const { data } = await apiClient.post<OrderDetail>(endpoints.orders.create, payload);
    return data;
  },

  track: async (orderNumber: string): Promise<OrderDetail> => {
    const { data } = await apiClient.get<OrderDetail>(endpoints.orders.track(orderNumber));
    return data;
  },

  list: async (query: OrderQuery): Promise<PagedResult<OrderListItem>> => {
    const { data } = await apiClient.get<PagedResult<OrderListItem>>(endpoints.orders.list, {
      params: query,
    });
    return data;
  },

  getById: async (id: number): Promise<OrderDetail> => {
    const { data } = await apiClient.get<OrderDetail>(endpoints.orders.byId(id));
    return data;
  },

  updateStatus: async (id: number, payload: UpdateOrderStatusRequest): Promise<OrderDetail> => {
    const { data } = await apiClient.put<OrderDetail>(endpoints.orders.status(id), payload);
    return data;
  },

  getStats: async (): Promise<OrderStats> => {
    const { data } = await apiClient.get<OrderStats>(endpoints.orders.stats);
    return data;
  },
};
