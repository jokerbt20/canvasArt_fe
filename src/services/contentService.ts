import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  CreateSlideFromPaintingImageRequest,
  CreateSlideRequest,
  Setting,
  Slide,
  UpdateSlideRequest,
  UpsertSettingsRequest,
} from "../types";

export const contentService = {
  getActiveSlides: async (): Promise<Slide[]> => {
    const { data } = await apiClient.get<Slide[]>(endpoints.slides.list);
    return data;
  },

  manageSlides: async (): Promise<Slide[]> => {
    const { data } = await apiClient.get<Slide[]>(endpoints.slides.manage);
    return data;
  },

  createSlide: async (payload: CreateSlideRequest, file: File): Promise<Slide> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    formData.append("file", file);
    const { data } = await apiClient.post<Slide>(endpoints.slides.list, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  createSlideFromPaintingImage: async (payload: CreateSlideFromPaintingImageRequest): Promise<Slide> => {
    const { data } = await apiClient.post<Slide>(endpoints.slides.fromPaintingImage, payload);
    return data;
  },

  updateSlideFromPaintingImage: async (id: number, payload: CreateSlideFromPaintingImageRequest): Promise<Slide> => {
    const { data } = await apiClient.put<Slide>(`${endpoints.slides.byId(id)}/from-painting-image`, payload);
    return data;
  },

  updateSlide: async (id: number, payload: UpdateSlideRequest, file?: File): Promise<Slide> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (file) formData.append("file", file);
    const { data } = await apiClient.put<Slide>(endpoints.slides.byId(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteSlide: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.slides.byId(id));
  },

  getSettings: async (group?: string): Promise<Setting[]> => {
    const { data } = await apiClient.get<Setting[]>(endpoints.settings.list, {
      params: group ? { group } : undefined,
    });
    return data;
  },

  upsertSettings: async (payload: UpsertSettingsRequest): Promise<void> => {
    await apiClient.put(endpoints.settings.list, payload);
  },
};
