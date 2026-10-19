"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BannerInput } from "@/domain/banner/Banner";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function useBanners() {
  const { listBanners } = useDependencies();
  return useQuery({ queryKey: queryKeys.banners, queryFn: () => listBanners() });
}

function useInvalidate() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.banners });
    void client.invalidateQueries({ queryKey: ["audit"] });
  };
}

export function useSaveBanner() {
  const { saveBanner } = useDependencies();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (v: { id: string | null; input: BannerInput }) => saveBanner(v), onSuccess: invalidate });
}

export function useToggleBanner() {
  const { toggleBanner } = useDependencies();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => toggleBanner(v), onSuccess: invalidate });
}

export function useDeleteBanner() {
  const { deleteBanner } = useDependencies();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => deleteBanner(id), onSuccess: invalidate });
}
