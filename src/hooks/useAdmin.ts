import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys";
import { authService } from "../services/authService";
import type { CreateUserRequest, PagedQuery } from "../types";

export function useAdminUsers(query: PagedQuery) {
  return useQuery({
    queryKey: queryKeys.auth.users(query),
    queryFn: () => authService.listUsers(query),
    placeholderData: (previous) => previous,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserRequest) => authService.createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "users"] }),
    // The dialog renders this error inline, so skip the global toast to avoid duplication.
    meta: { suppressErrorToast: true, successMessage: "User created." },
  });
}
