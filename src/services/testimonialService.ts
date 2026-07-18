import { apiClient } from "../api/axios";
import { endpoints } from "../api/endpoints";
import type { CreateTestimonialRequest, Testimonial, UpdateTestimonialRequest } from "../types";

export const testimonialService = {
  getActive: async (): Promise<Testimonial[]> => {
    const { data } = await apiClient.get<Testimonial[]>(endpoints.testimonials.list);
    return data;
  },

  manage: async (): Promise<Testimonial[]> => {
    const { data } = await apiClient.get<Testimonial[]>(endpoints.testimonials.manage);
    return data;
  },

  create: async (payload: CreateTestimonialRequest, file?: File): Promise<Testimonial> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (file) formData.append("file", file);
    const { data } = await apiClient.post<Testimonial>(endpoints.testimonials.list, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (id: number, payload: UpdateTestimonialRequest, file?: File): Promise<Testimonial> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    if (file) formData.append("file", file);
    const { data } = await apiClient.put<Testimonial>(endpoints.testimonials.byId(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.testimonials.byId(id));
  },
};
