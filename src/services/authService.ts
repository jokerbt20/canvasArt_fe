import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  AdminUser,
  AuthResponse,
  ChangePasswordRequest,
  CreateUserRequest,
  LoginRequest,
  PagedQuery,
  PagedResult,
  RevokeTokenRequest,
} from "../types";

export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(endpoints.auth.login, payload);
    return data;
  },

  revoke: async (payload: RevokeTokenRequest): Promise<void> => {
    await apiClient.post(endpoints.auth.revoke, payload);
  },

  me: async (): Promise<AdminUser> => {
    const { data } = await apiClient.get<AdminUser>(endpoints.auth.me);
    return data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(endpoints.auth.changePassword, payload);
  },

  createUser: async (payload: CreateUserRequest): Promise<AdminUser> => {
    const { data } = await apiClient.post<AdminUser>(endpoints.auth.users, payload);
    return data;
  },

  listUsers: async (query: PagedQuery): Promise<PagedResult<AdminUser>> => {
    const { data } = await apiClient.get<PagedResult<AdminUser>>(endpoints.auth.users, {
      params: query,
    });
    return data;
  },
};
