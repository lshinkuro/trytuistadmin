"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AppError } from "@/domain/shared/errors";
import { DependenciesProvider } from "./DependenciesProvider";

/** Sesi habis (refresh token juga sudah tidak berlaku) → kembali ke halaman login. */
function onSessionError(error: unknown) {
  if (error instanceof AppError && error.isUnauthorized && typeof window !== "undefined") {
    const next = window.location.pathname + window.location.search;
    if (window.location.pathname !== "/login") {
      // Muat ulang penuh: cache query milik sesi lama ikut dibuang.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?expired=1&next=${encodeURIComponent(next)}`);
    }
  }
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: onSessionError }),
        mutationCache: new MutationCache({ onError: onSessionError }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry: (count, error) =>
              !(error instanceof AppError && error.status >= 400 && error.status < 500) && count < 2,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <DependenciesProvider>{children}</DependenciesProvider>
    </QueryClientProvider>
  );
}
