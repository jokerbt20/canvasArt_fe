import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { promotionService } from "../services/promotionService";
import type {
  CreateCombinationPromotionRequest,
  CreatePromotionRequest,
  PromotionQuery,
  UpdateCombinationPromotionRequest,
  UpdatePromotionRequest,
} from "../types";

export function usePromotions(query: PromotionQuery) {
  return useQuery({
    queryKey: queryKeys.promotions.list(query),
    queryFn: () => promotionService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePromotionRequest) => promotionService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all }),
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePromotionRequest }) =>
      promotionService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all }),
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => promotionService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all }),
  });
}

export function useCombinationPromotions(query: PromotionQuery) {
  return useQuery({
    queryKey: queryKeys.promotions.combinations(query),
    queryFn: () => promotionService.listCombinations(query),
    placeholderData: (previous) => previous,
  });
}

export function useCreateCombinationPromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCombinationPromotionRequest) =>
      promotionService.createCombination(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all }),
  });
}

export function useUpdateCombinationPromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCombinationPromotionRequest }) =>
      promotionService.updateCombination(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all }),
  });
}

export function useDeleteCombinationPromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => promotionService.removeCombination(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all }),
  });
}
