"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderFilter, StatusChange } from "@/domain/order/Order";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useOrders(filter: OrderFilter) {
  const { listOrders } = useDependencies();
  return useQuery({
    queryKey: queryKeys.orders(filter),
    queryFn: () => listOrders(filter),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useOrder(id: string) {
  const { getOrder } = useDependencies();
  return useQuery({ queryKey: queryKeys.order(id), queryFn: () => getOrder(id) });
}

export function useChangeOrderStatus() {
  const { changeOrderStatus } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (change: StatusChange) => changeOrderStatus(change),
    onSuccess: (order) => {
      client.setQueryData(queryKeys.order(order.id), order);
      void client.invalidateQueries({ queryKey: ["orders", "list"] });
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}
