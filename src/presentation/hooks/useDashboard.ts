"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DateRange } from "@/domain/shared/dateRange";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useDashboard(range: DateRange) {
  const { getDashboard } = useDependencies();
  return useQuery({
    queryKey: queryKeys.dashboard(range),
    queryFn: () => getDashboard(range),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000, // pesanan baru masuk terus
  });
}
