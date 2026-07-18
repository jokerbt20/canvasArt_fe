import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  CreateFrameRequest,
  FrameDetail,
  FrameListItem,
  FrameQuery,
  PagedResult,
  UpdateFrameRequest,
} from "../types";

export const frameService = {
  list: async (query: FrameQuery): Promise<PagedResult<FrameListItem>> => {
    const { data } = await apiClient.get<PagedResult<FrameListItem>>(endpoints.frames.list, {
      params: query,
    });
    return data;
  },

  getById: async (id: number): Promise<FrameDetail> => {
    const { data } = await apiClient.get<FrameDetail>(endpoints.frames.byId(id));
    return data;
  },

  manage: async (query: FrameQuery): Promise<PagedResult<FrameListItem>> => {
    const { data } = await apiClient.get<PagedResult<FrameListItem>>(endpoints.frames.manage, {
      params: query,
    });
    return data;
  },

  create: async (payload: CreateFrameRequest): Promise<FrameDetail> => {
    const { data } = await apiClient.post<FrameDetail>(endpoints.frames.list, payload);
    return data;
  },

  update: async (id: number, payload: UpdateFrameRequest): Promise<FrameDetail> => {
    const { data } = await apiClient.put<FrameDetail>(endpoints.frames.byId(id), payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.frames.byId(id));
  },

  uploadImage: async (id: number, file: File): Promise<FrameDetail> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<FrameDetail>(endpoints.frames.image(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
