import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  CreatePaintingRequest,
  PagedResult,
  PaintingDetail,
  PaintingImage,
  PaintingListItem,
  PaintingQuery,
  UpdatePaintingRequest,
} from "../types";

export const paintingService = {
  list: async (query: PaintingQuery): Promise<PagedResult<PaintingListItem>> => {
    const { data } = await apiClient.get<PagedResult<PaintingListItem>>(
      endpoints.paintings.list,
      { params: query },
    );
    return data;
  },

  getBySlug: async (slug: string): Promise<PaintingDetail> => {
    const { data } = await apiClient.get<PaintingDetail>(endpoints.paintings.bySlug(slug));
    return data;
  },

  manage: async (query: PaintingQuery): Promise<PagedResult<PaintingListItem>> => {
    const { data } = await apiClient.get<PagedResult<PaintingListItem>>(
      endpoints.paintings.manage,
      { params: query },
    );
    return data;
  },

  manageById: async (id: number): Promise<PaintingDetail> => {
    const { data } = await apiClient.get<PaintingDetail>(endpoints.paintings.manageById(id));
    return data;
  },

  create: async (payload: CreatePaintingRequest): Promise<PaintingDetail> => {
    const { data } = await apiClient.post<PaintingDetail>(endpoints.paintings.list, payload);
    return data;
  },

  update: async (id: number, payload: UpdatePaintingRequest): Promise<PaintingDetail> => {
    const { data } = await apiClient.put<PaintingDetail>(endpoints.paintings.byId(id), payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.paintings.byId(id));
  },

  uploadImage: async (id: number, file: File): Promise<PaintingImage> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<PaintingImage>(endpoints.paintings.images(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteImage: async (id: number, imageId: number): Promise<void> => {
    await apiClient.delete(endpoints.paintings.image(id, imageId));
  },

  setPrimaryImage: async (id: number, imageId: number): Promise<void> => {
    await apiClient.put(endpoints.paintings.primaryImage(id, imageId));
  },
};
