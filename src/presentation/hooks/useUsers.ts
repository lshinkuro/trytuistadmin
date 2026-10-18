"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UserFilter } from "@/domain/user/User";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

/** Logic data ada di sini; komponen `UserList` cukup menerima hasilnya. */
export function useUsers(filter: UserFilter) {
  const { listUsers } = useDependencies();
  return useQuery({
    queryKey: queryKeys.users(filter),
    queryFn: () => listUsers(filter),
    placeholderData: keepPreviousData,
  });
}
