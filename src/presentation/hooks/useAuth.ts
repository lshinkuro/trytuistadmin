"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Credentials } from "@/domain/auth/Auth";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useCurrentAdmin() {
  const { getCurrentAdmin } = useDependencies();
  return useQuery({ queryKey: queryKeys.admin, queryFn: getCurrentAdmin, staleTime: 5 * 60_000 });
}

export function useLogin() {
  const { login } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (credentials: Credentials) => login(credentials),
    onSuccess: (admin) => client.setQueryData(queryKeys.admin, admin),
  });
}

export function useLogout() {
  const { logout } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      client.clear();
      // Muat ulang penuh supaya semua state & cache klien hilang.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    },
  });
}
