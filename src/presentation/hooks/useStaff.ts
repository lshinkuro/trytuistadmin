"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useStaff() {
  const { listStaff } = useDependencies();
  return useQuery({ queryKey: queryKeys.staff, queryFn: listStaff });
}

function useInvalidateStaff() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.staff });
    void client.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useCreateStaff() {
  const { createStaff } = useDependencies();
  return useMutation({ mutationFn: createStaff, onSuccess: useInvalidateStaff() });
}

export function useUpdateStaff() {
  const { updateStaff } = useDependencies();
  return useMutation({ mutationFn: updateStaff, onSuccess: useInvalidateStaff() });
}
