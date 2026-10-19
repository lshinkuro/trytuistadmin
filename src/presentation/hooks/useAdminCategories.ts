"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CategoryInput } from "@/domain/category/Category";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useAdminCategories() {
  const { listAdminCategories } = useDependencies();
  return useQuery({ queryKey: queryKeys.adminCategories, queryFn: listAdminCategories });
}

export function useSaveCategory() {
  const { saveCategory } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (args: { id?: string; input: Partial<CategoryInput> }) => saveCategory(args),
    onSuccess: () => {
      // Pilihan kategori di form menu & filter produk ikut diperbarui.
      void client.invalidateQueries({ queryKey: queryKeys.adminCategories });
      void client.invalidateQueries({ queryKey: queryKeys.categories });
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
