import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type { CreateTagRequest, Tag, UpdateTagRequest } from "../types";

export const tagService = {
  list: async (): Promise<Tag[]> => {
    const { data } = await apiClient.get<Tag[]>(endpoints.tags.list);
    return data;
  },

  create: async (payload: CreateTagRequest): Promise<Tag> => {
    const { data } = await apiClient.post<Tag>(endpoints.tags.list, payload);
    return data;
  },

  update: async (id: number, payload: UpdateTagRequest): Promise<Tag> => {
    const { data } = await apiClient.put<Tag>(endpoints.tags.byId(id), payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.tags.byId(id));
  },
};
