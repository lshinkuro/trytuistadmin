"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DealInput } from "@/domain/deal/Deal";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useDeals() {
  const { listDeals } = useDependencies();
  return useQuery({ queryKey: queryKeys.deals, queryFn: listDeals });
}

function useInvalidateDeals() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.deals });
    void client.invalidateQueries({ queryKey: ["products"] }); // harga berlaku ikut berubah
    void client.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useSaveDeal() {
  const { saveDeal } = useDependencies();
  const onSuccess = useInvalidateDeals();
  return useMutation({
    mutationFn: (args: { id?: string; input: DealInput; normalPrice: number | null }) => saveDeal(args),
    onSuccess,
  });
}

export function useToggleDeal() {
  const { toggleDeal } = useDependencies();
  const onSuccess = useInvalidateDeals();
  return useMutation({ mutationFn: toggleDeal, onSuccess });
}

export function useDeleteDeal() {
  const { deleteDeal } = useDependencies();
  const onSuccess = useInvalidateDeals();
  return useMutation({ mutationFn: deleteDeal, onSuccess });
}
