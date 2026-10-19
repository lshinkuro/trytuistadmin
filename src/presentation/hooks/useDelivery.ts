"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeliveryPreviewInput, DeliverySettings } from "@/domain/delivery/DeliverySettings";
import { useDependencies } from "../providers/DependenciesProvider";
import { useDebouncedValue } from "./useDebouncedValue";
import { queryKeys } from "./queryKeys";

export function useDeliverySettings() {
  const { getDeliverySettings } = useDependencies();
  return useQuery({ queryKey: queryKeys.delivery, queryFn: () => getDeliverySettings() });
}

/** Contoh perhitungan untuk draf form (dihitung server, tidak disimpan). */
export function useDeliveryPreview(input: DeliveryPreviewInput | null) {
  const { previewDeliverySettings } = useDependencies();
  const debounced = useDebouncedValue(input, 350);
  return useQuery({
    queryKey: queryKeys.deliveryPreview(debounced as DeliveryPreviewInput),
    queryFn: () => previewDeliverySettings(debounced as DeliveryPreviewInput),
    enabled: debounced !== null,
    placeholderData: keepPreviousData,
  });
}

export function useSaveDeliverySettings() {
  const { saveDeliverySettings } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (settings: DeliverySettings) => saveDeliverySettings(settings),
    onSuccess: (overview) => {
      client.setQueryData(queryKeys.delivery, overview);
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
