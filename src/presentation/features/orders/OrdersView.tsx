"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ORDER_STATUSES, type OrderFilter, type OrderStatus } from "@/domain/order/Order";
import { ACTIVE_STATUSES, ORDER_STATUS_LABEL } from "@/domain/order/orderStatus";
import { pageCount } from "@/domain/shared/pagination";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { EmptyState, ErrorState, Pagination } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, Input, Skeleton, Table, TBody, TD, TH, THead, TR } from "../../components/ui";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { StoreSelect } from "../stores/StoreSelect";
import { useOrders } from "../../hooks/useOrders";
import { OrderStatusBadge, PAYMENT_LABEL } from "./OrderStatusBadge";

const PAGE_SIZE = 20;

/** Tab status: "Aktif" = yang masih perlu ditangani. */
const TABS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "active", label: "Aktif", statuses: ACTIVE_STATUSES },
  { key: "all", label: "Semua", statuses: [] },
  ...ORDER_STATUSES.map((s) => ({ key: s, label: ORDER_STATUS_LABEL[s], statuses: [s] })),
];

function parseStatuses(value: string | null): OrderStatus[] {
  if (!value) return [];
  return value.split(",").filter((s): s is OrderStatus => (ORDER_STATUSES as readonly string[]).includes(s));
}

export function OrdersView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statuses = useMemo(
    () => (params.has("status") ? parseStatuses(params.get("status")) : ACTIVE_STATUSES),
    [params],
  );
  const storeId = params.get("store") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debouncedQuery = useDebouncedValue(query);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if ((params.get("q") ?? "") !== debouncedQuery) update({ q: debouncedQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const filter: OrderFilter = {
    statuses,
    query: params.get("q") ?? "",
    range: from && to ? { from, to } : null,
    storeId,
    page,
    limit: PAGE_SIZE,
  };
  const orders = useOrders(filter);
  const activeKey = TABS.find((t) => t.statuses.join(",") === statuses.join(","))?.key;

  return (
    <>
      <PageHeader
        title="Pesanan"
        description="Pesanan terbaru di atas. Buka pesanan untuk menandai sukses, gagal, atau batal."
      />

      <div className="mb-4 flex flex-col gap-3">
        <div role="tablist" aria-label="Filter status" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={activeKey === tab.key}
              onClick={() => update({ status: tab.key === "active" ? null : tab.key === "all" ? "all" : tab.statuses.join(",") })}
              className={cn(
                "h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-colors",
                activeKey === tab.key
                  ? "border-ink bg-ink text-surface"
                  : "border-line-strong bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="relative min-w-60 flex-1">
            <span className="sr-only">Cari pesanan</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor pesanan, nama, atau email pelanggan"
              className="pl-9"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink-muted">
            <span className="text-xs font-semibold">Outlet</span>
            <StoreSelect value={storeId} onChange={(id) => update({ store: id })} className="w-48" />
          </label>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold">Dari</span>
              <Input type="date" value={from} max={to || undefined} onChange={(e) => update({ from: e.target.value, to: to || e.target.value })} className="w-40" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold">Sampai</span>
              <Input type="date" value={to} min={from || undefined} onChange={(e) => update({ to: e.target.value, from: from || e.target.value })} className="w-40" />
            </label>
            {(from || to) && (
              <button type="button" className="mt-5 text-sm font-semibold text-brand hover:underline" onClick={() => update({ from: null, to: null })}>
                Hapus tanggal
              </button>
            )}
          </div>
        </div>
      </div>

      {orders.isError ? (
        <ErrorState error={orders.error} onRetry={() => orders.refetch()} />
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Pesanan</TH>
                <TH>Pelanggan</TH>
                <TH>Item</TH>
                <TH className="text-right">Total</TH>
                <TH>Outlet</TH>
                <TH>Pembayaran</TH>
                <TH>Status</TH>
                <TH>Dibuat</TH>
              </TR>
            </THead>
            <TBody>
              {orders.isPending &&
                Array.from({ length: 6 }, (_, i) => (
                  <TR key={i}>
                    {Array.from({ length: 8 }, (_, j) => (
                      <TD key={j}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </TD>
                    ))}
                  </TR>
                ))}
              {orders.data?.items.map((o) => (
                <TR key={o.id} className="hover:bg-surface-muted">
                  <TD className="font-semibold">
                    <Link href={`/orders/${o.id}`} className="text-ink hover:text-brand hover:underline">
                      {o.orderNumber}
                    </Link>
                  </TD>
                  <TD>
                    <div className="flex flex-col">
                      <span className="font-medium">{o.customer.name}</span>
                      <span className="text-xs text-ink-muted">{o.customer.email}</span>
                    </div>
                  </TD>
                  <TD className="max-w-64">
                    <span className="line-clamp-1">{o.itemSummary}</span>
                    <span className="tabular text-xs text-ink-muted">{o.quantity} item</span>
                  </TD>
                  <TD className="tabular text-right font-semibold">{formatRupiah(o.total)}</TD>
                  <TD className="whitespace-nowrap text-ink-muted">{o.storeName}</TD>
                  <TD className="text-ink-muted">{PAYMENT_LABEL[o.paymentMethod]}</TD>
                  <TD>
                    <OrderStatusBadge status={o.status} />
                  </TD>
                  <TD className="tabular whitespace-nowrap text-ink-muted">{formatDateTime(o.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {orders.data && orders.data.items.length === 0 && (
            <EmptyState
              title="Tidak ada pesanan"
              description={filter.query || filter.range || storeId ? "Coba ubah pencarian, outlet, atau rentang tanggal." : "Pesanan baru dari aplikasi akan muncul di sini."}
            />
          )}
          {orders.data && (
            <Pagination page={orders.data.page} pageCount={pageCount(orders.data)} onChange={(p) => update({ page: String(p) })} />
          )}
        </Card>
      )}
    </>
  );
}
