"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductFilter, ProductInput, ProductUpdate } from "@/domain/product/Product";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useProducts(filter: ProductFilter) {
  const { listProducts } = useDependencies();
  return useQuery({ queryKey: queryKeys.products(filter), queryFn: () => listProducts(filter) });
}

export function useCategories() {
  const { listCategories } = useDependencies();
  return useQuery({ queryKey: queryKeys.categories, queryFn: listCategories, staleTime: 10 * 60_000 });
}

export function useCreateProduct() {
  const { createProduct } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["products"] });
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

export function useUpdateProduct() {
  const { updateProduct } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (update: ProductUpdate) => updateProduct(update),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["products"] });
      void client.invalidateQueries({ queryKey: queryKeys.deals });
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
