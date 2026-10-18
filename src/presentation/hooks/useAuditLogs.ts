"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useAuditLogs(page: number, limit = 30) {
  const { listAuditLogs } = useDependencies();
  return useQuery({
    queryKey: queryKeys.audit(page),
    queryFn: () => listAuditLogs({ page, limit }),
    placeholderData: keepPreviousData,
  });
}
