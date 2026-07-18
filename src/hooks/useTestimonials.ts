import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { testimonialService } from "../services/testimonialService";
import type { CreateTestimonialRequest, UpdateTestimonialRequest } from "../types";

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials.active,
    queryFn: testimonialService.getActive,
  });
}

export function useManageTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials.manage,
    queryFn: testimonialService.manage,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, file }: { payload: CreateTestimonialRequest; file?: File }) =>
      testimonialService.create(payload, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all }),
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, file }: { id: number; payload: UpdateTestimonialRequest; file?: File }) =>
      testimonialService.update(id, payload, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all }),
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => testimonialService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.testimonials.all }),
  });
}
