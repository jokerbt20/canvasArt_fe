import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { orderService } from "../services/orderService";
import type { CreateOrderRequest, OrderQuery, UpdateOrderStatusRequest } from "../types";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderRequest) => orderService.create(payload),
  });
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.byId(id ?? 0),
    queryFn: () => orderService.getById(id as number),
    enabled: Boolean(id),
  });
}

export function useOrderTracking(orderNumber: string | undefined) {
  return useQuery({
    queryKey: ["orders", "track", orderNumber ?? ""],
    queryFn: () => orderService.track(orderNumber as string),
    enabled: Boolean(orderNumber),
  });
}

export function useOrders(query: OrderQuery) {
  return useQuery({
    queryKey: queryKeys.orders.list(query),
    queryFn: () => orderService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: queryKeys.orders.stats,
    queryFn: orderService.getStats,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateOrderStatusRequest }) =>
      orderService.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.stats });
    },
  });
}
