import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { frameService } from "../services/frameService";
import type { CreateFrameRequest, FrameQuery, UpdateFrameRequest } from "../types";

export function useFrames(query: FrameQuery) {
  return useQuery({
    queryKey: queryKeys.frames.list(query),
    queryFn: () => frameService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useManageFrames(query: FrameQuery) {
  return useQuery({
    queryKey: queryKeys.frames.manage(query),
    queryFn: () => frameService.manage(query),
    placeholderData: (previous) => previous,
  });
}

export function useFrame(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.frames.byId(id ?? 0),
    queryFn: () => frameService.getById(id as number),
    enabled: Boolean(id),
  });
}

export function useCreateFrame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFrameRequest) => frameService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.frames.all }),
  });
}

export function useUpdateFrame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateFrameRequest }) =>
      frameService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.frames.all }),
  });
}

export function useDeleteFrame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => frameService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.frames.all }),
  });
}

export function useUploadFrameImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => frameService.uploadImage(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.frames.all }),
  });
}
