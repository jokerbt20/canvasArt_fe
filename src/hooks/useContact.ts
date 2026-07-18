import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { contactService } from "../services/contactService";
import type { ContactMessageQuery, CreateContactMessageRequest } from "../types";

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (payload: CreateContactMessageRequest) => contactService.submit(payload),
  });
}

export function useContactMessages(query: ContactMessageQuery) {
  return useQuery({
    queryKey: queryKeys.contact.list(query),
    queryFn: () => contactService.list(query),
    placeholderData: (previous) => previous,
  });
}

export function useMarkContactMessageRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact"] }),
  });
}
