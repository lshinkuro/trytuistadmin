"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { EmptyState, ErrorState } from "../../components/common/States";
import { Input, Skeleton } from "../../components/ui";
import { useHomeData, useOutlet } from "../../hooks/useShopData";
import { ProductCard } from "../shop/common";

export function MenuView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = params.get("kategori") ?? "";
  const [query, setQuery] = useState("");
  const { storeId } = useOutlet();
  const { categories, products } = useHomeData(storeId);

  const q = query.trim().toLowerCase();
  const list = (products.data ?? [])
    .filter((p) => !category || p.categoryId === category)
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    // Yang tersedia dulu.
    .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));

  const chip = (id: string, label: string) => (
    <button
      key={id || "all"}
      type="button"
      onClick={() => router.replace(id ? `${pathname}?kategori=${encodeURIComponent(id)}` : pathname, { scroll: false })}
      className={cn(
        "h-8 shrink-0 rounded-full border px-3 text-sm font-semibold",
        category === id ? "border-ink bg-ink text-surface" : "border-line-strong bg-surface text-ink-muted",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <label className="relative">
        <span className="sr-only">Cari menu</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kopi, nasi goreng, paket…" className="pl-9" />
      </label>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chip("", "Semua")}
        {(categories.data ?? []).map((c) => chip(c.id, `${c.icon} ${c.name}`))}
      </div>
      {products.isError && <ErrorState error={products.error} onRetry={() => products.refetch()} />}
      {products.isPending && <Skeleton className="h-96 w-full" />}
      {products.data && list.length === 0 && <EmptyState title="Menu tidak ditemukan" description="Coba kata lain atau kategori lain." />}
      <div className="grid grid-cols-2 gap-3">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
