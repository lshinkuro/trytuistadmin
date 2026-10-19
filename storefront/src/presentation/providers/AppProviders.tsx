"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AppError } from "@/domain/shared/errors";
import { DependenciesProvider } from "./DependenciesProvider";
import { ShopProvider } from "./ShopProvider";

const PROTECTED = ["/keranjang", "/pesanan", "/akun", "/bayar"];

/** Sesi habis di halaman yang butuh login → ke /masuk. Di katalog, tamu tetap boleh melihat menu. */
function onSessionError(error: unknown) {
  if (!(error instanceof AppError && error.isUnauthorized) || typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    // Muat ulang penuh: cache query milik sesi lama ikut dibuang.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/masuk?expired=1&next=${encodeURIComponent(pathname + search)}`);
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
            retry: (count, error) => !(error instanceof AppError && error.status >= 400 && error.status < 500) && count < 2,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <DependenciesProvider>
        <ShopProvider>{children}</ShopProvider>
      </DependenciesProvider>
    </QueryClientProvider>
  );
}
