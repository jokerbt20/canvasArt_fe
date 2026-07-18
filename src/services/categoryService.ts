import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  Category,
  CategoryQuery,
  CreateCategoryRequest,
  PagedResult,
  UpdateCategoryRequest,
} from "../types";

export const categoryService = {
  listActive: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>(endpoints.categories.list);
    return data;
  },

  getById: async (id: number): Promise<Category> => {
    const { data } = await apiClient.get<Category>(endpoints.categories.byId(id));
    return data;
  },

  manage: async (query: CategoryQuery): Promise<PagedResult<Category>> => {
    const { data } = await apiClient.get<PagedResult<Category>>(endpoints.categories.manage, {
      params: query,
    });
    return data;
  },

  create: async (payload: CreateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.post<Category>(endpoints.categories.list, payload);
    return data;
  },

  update: async (id: number, payload: UpdateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.put<Category>(endpoints.categories.byId(id), payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.categories.byId(id));
  },
};
