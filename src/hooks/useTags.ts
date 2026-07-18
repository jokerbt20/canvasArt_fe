import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { tagService } from "../services/tagService";
import type { CreateTagRequest, UpdateTagRequest } from "../types";

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: tagService.list,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTagRequest) => tagService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags.all }),
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTagRequest }) =>
      tagService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags.all }),
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tagService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tags.all }),
  });
}
