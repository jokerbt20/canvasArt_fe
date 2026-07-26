import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { paintingService } from "../services/paintingService";
import type { CreatePaintingRequest, PaintingQuery, UpdatePaintingRequest } from "../types";

export function usePaintings(query: PaintingQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.paintings.list(query),
    queryFn: () => paintingService.list(query),
    placeholderData: (previous) => previous,
    enabled: options?.enabled,
  });
}

export function useFeaturedPaintings() {
  return useQuery({
    queryKey: queryKeys.paintings.list({ isFeatured: true, pageSize: 8, sortBy: "createdAt", sortDir: "desc" }),
    queryFn: () =>
      paintingService.list({ isFeatured: true, pageSize: 8, sortBy: "createdAt", sortDir: "desc" }),
  });
}

export function usePainting(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.paintings.bySlug(slug ?? ""),
    queryFn: () => paintingService.getBySlug(slug as string),
    enabled: Boolean(slug),
  });
}

export function useManagePaintings(query: PaintingQuery) {
  return useQuery({
    queryKey: queryKeys.paintings.manage(query),
    queryFn: () => paintingService.manage(query),
    placeholderData: (previous) => previous,
  });
}

export function useManagePainting(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.paintings.manageById(id ?? 0),
    queryFn: () => paintingService.manageById(id as number),
    enabled: Boolean(id),
  });
}

export function useCreatePainting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaintingRequest) => paintingService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paintings.all }),
  });
}

export function useUpdatePainting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePaintingRequest }) =>
      paintingService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paintings.all }),
  });
}

export function useDeletePainting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paintingService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paintings.all }),
  });
}

export function useUploadPaintingImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => paintingService.uploadImage(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paintings.all }),
  });
}

export function useDeletePaintingImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: number; imageId: number }) =>
      paintingService.deleteImage(id, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paintings.all }),
  });
}

export function useSetPrimaryPaintingImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }: { id: number; imageId: number }) =>
      paintingService.setPrimaryImage(id, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paintings.all }),
  });
}
