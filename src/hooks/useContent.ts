import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { contentService } from "../services/contentService";
import type {
  CreateSlideFromPaintingImageRequest,
  CreateSlideRequest,
  UpdateSlideRequest,
  UpsertSettingsRequest,
} from "../types";

export function useActiveSlides() {
  return useQuery({
    queryKey: queryKeys.slides.active,
    queryFn: contentService.getActiveSlides,
  });
}

export function useManageSlides() {
  return useQuery({
    queryKey: queryKeys.slides.manage,
    queryFn: contentService.manageSlides,
  });
}

export function useCreateSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, file }: { payload: CreateSlideRequest; file: File }) =>
      contentService.createSlide(payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.manage });
    },
  });
}

export function useCreateSlideFromPaintingImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlideFromPaintingImageRequest) =>
      contentService.createSlideFromPaintingImage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.manage });
    },
  });
}

export function useUpdateSlideFromPaintingImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateSlideFromPaintingImageRequest }) =>
      contentService.updateSlideFromPaintingImage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.manage });
    },
  });
}

export function useUpdateSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, file }: { id: number; payload: UpdateSlideRequest; file?: File }) =>
      contentService.updateSlide(id, payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.manage });
    },
  });
}

export function useDeleteSlide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contentService.deleteSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.slides.manage });
    },
  });
}

export function useSettings(group?: string) {
  return useQuery({
    queryKey: queryKeys.settings.all(group),
    queryFn: () => contentService.getSettings(group),
  });
}

export function useUpsertSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertSettingsRequest) => contentService.upsertSettings(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });
}
