import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { distributorService } from "../services/distributorService";
import type {
  ApplyPromoCodeRequest,
  CreateDistributorRequest,
  CreatePromoCodeRequest,
  DistributorDashboardQuery,
  DistributorQuery,
  UpdateDistributorRequest,
  UpdatePromoCodeRequest,
} from "../types";

export function useDistributors(query: DistributorQuery) {
  return useQuery({
    queryKey: queryKeys.distributors.list(query),
    queryFn: () => distributorService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useCreateDistributor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDistributorRequest) => distributorService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all }),
  });
}

export function useUpdateDistributor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDistributorRequest }) =>
      distributorService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all }),
  });
}

export function useDeleteDistributor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => distributorService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all }),
  });
}

export function useDistributorDashboard(query: DistributorDashboardQuery) {
  return useQuery({
    queryKey: queryKeys.distributors.dashboard(query),
    queryFn: () => distributorService.dashboard(query),
    placeholderData: (previous) => previous,
  });
}

export function usePromoCodes(distributorId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.distributors.promoCodes(distributorId ?? 0),
    queryFn: () => distributorService.promoCodes(distributorId as number),
    enabled: Boolean(distributorId),
  });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePromoCodeRequest) => distributorService.createPromoCode(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all }),
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePromoCodeRequest }) =>
      distributorService.updatePromoCode(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all }),
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => distributorService.removePromoCode(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all }),
  });
}

export function useApplyPromoCode() {
  return useMutation({
    mutationFn: (payload: ApplyPromoCodeRequest) => distributorService.applyPromoCode(payload),
  });
}
