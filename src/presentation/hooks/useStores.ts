"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoreInput } from "@/domain/store/Store";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useStores() {
  const { listStores } = useDependencies();
  return useQuery({ queryKey: queryKeys.stores, queryFn: listStores, refetchInterval: 60_000 });
}

function useInvalidateStores() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.stores });
    void client.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useSaveStore() {
  const { saveStore } = useDependencies();
  const onSuccess = useInvalidateStores();
  return useMutation({ mutationFn: (args: { id?: string; input: Partial<StoreInput> }) => saveStore(args), onSuccess });
}

export function useSetStoreTempClosed() {
  const { setStoreTempClosed } = useDependencies();
  const onSuccess = useInvalidateStores();
  return useMutation({ mutationFn: setStoreTempClosed, onSuccess });
}

export function useSetStoreProduct() {
  const { setStoreProduct } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: setStoreProduct,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["products"] });
      void client.invalidateQueries({ queryKey: queryKeys.stores });
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
