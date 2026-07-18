import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type {
  ContactMessage,
  ContactMessageQuery,
  CreateContactMessageRequest,
  PagedResult,
} from "../types";

export const contactService = {
  submit: async (payload: CreateContactMessageRequest): Promise<ContactMessage> => {
    const { data } = await apiClient.post<ContactMessage>(endpoints.contact.submit, payload);
    return data;
  },

  list: async (query: ContactMessageQuery): Promise<PagedResult<ContactMessage>> => {
    const { data } = await apiClient.get<PagedResult<ContactMessage>>(endpoints.contact.list, {
      params: query,
    });
    return data;
  },

  markRead: async (id: number): Promise<ContactMessage> => {
    const { data } = await apiClient.put<ContactMessage>(endpoints.contact.markRead(id));
    return data;
  },
};
