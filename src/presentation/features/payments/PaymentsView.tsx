"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABEL, paymentTypeLabel, type PaymentFilter, type PaymentStatus } from "@/domain/payment/Payment";
import { pageCount } from "@/domain/shared/pagination";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { EmptyState, ErrorState, Pagination } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, Input, Skeleton, Table, TBody, TD, TH, THead, TR } from "../../components/ui";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePayments } from "../../hooks/usePayments";
import { StoreSelect } from "../stores/StoreSelect";
import { PaymentStatusBadge, RefundStatusBadge } from "./PaymentStatusBadge";

const PAGE_SIZE = 20;

const TABS: { key: string; label: string; statuses: PaymentStatus[]; refundOnly?: boolean }[] = [
  { key: "all", label: "Semua", statuses: [] },
  ...PAYMENT_STATUSES.map((s) => ({ key: s, label: PAYMENT_STATUS_LABEL[s], statuses: [s] })),
  { key: "refund", label: "Refund", statuses: [], refundOnly: true },
];

export function PaymentsView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabKey = params.get("tab") ?? "all";
  const tab = useMemo(() => TABS.find((t) => t.key === tabKey) ?? TABS[0]!, [tabKey]);
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

  const filter: PaymentFilter = {
    statuses: tab.statuses,
    refundOnly: Boolean(tab.refundOnly),
    query: params.get("q") ?? "",
    range: from && to ? { from, to } : null,
    storeId,
    page,
    limit: PAGE_SIZE,
  };
  const payments = usePayments(filter);

  return (
    <>
      <PageHeader
        title="Pembayaran"
        description="Sesi Bayar Online lewat Midtrans. Pesanan baru dibuat setelah lunas; refund dilakukan dari detail pembayaran."
      />

      <div className="mb-4 flex flex-col gap-3">
        <div role="tablist" aria-label="Filter status" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={tab.key === t.key}
              onClick={() => update({ tab: t.key === "all" ? null : t.key })}
              className={cn(
                "h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-colors",
                tab.key === t.key ? "border-ink bg-ink text-surface" : "border-line-strong bg-surface text-ink-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="relative min-w-60 flex-1">
            <span className="sr-only">Cari pembayaran</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari ID Midtrans, nomor pesanan, nama, atau email"
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

      {payments.isError ? (
        <ErrorState error={payments.error} onRetry={() => payments.refetch()} />
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>ID Midtrans</TH>
                <TH>Pelanggan</TH>
                <TH className="text-right">Jumlah</TH>
                <TH>Metode</TH>
                <TH>Status</TH>
                <TH>Pesanan</TH>
                <TH>Outlet</TH>
                <TH>Dibuat</TH>
              </TR>
            </THead>
            <TBody>
              {payments.isPending &&
                Array.from({ length: 6 }, (_, i) => (
                  <TR key={i}>
                    {Array.from({ length: 8 }, (_, j) => (
                      <TD key={j}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </TD>
                    ))}
                  </TR>
                ))}
              {payments.data?.items.map((p) => (
                <TR key={p.id} className="hover:bg-surface-muted">
                  <TD className="font-semibold">
                    <Link href={`/payments/${p.id}`} className="tabular text-ink hover:text-brand hover:underline">
                      {p.providerOrderId}
                    </Link>
                  </TD>
                  <TD>
                    <div className="flex flex-col">
                      <span className="font-medium">{p.customer.name}</span>
                      <span className="text-xs text-ink-muted">{p.customer.email}</span>
                    </div>
                  </TD>
                  <TD className="tabular text-right">
                    <span className="font-semibold">{formatRupiah(p.amount)}</span>
                    {p.refundedAmount > 0 && <span className="block text-xs text-info">−{formatRupiah(p.refundedAmount)} refund</span>}
                  </TD>
                  <TD className="text-ink-muted">{paymentTypeLabel(p.paymentType)}</TD>
                  <TD>
                    <div className="flex flex-col items-start gap-1">
                      <PaymentStatusBadge status={p.status} />
                      {p.refundStatus && <RefundStatusBadge status={p.refundStatus} />}
                    </div>
                  </TD>
                  <TD>
                    {p.order ? (
                      <Link href={`/orders/${p.order.id}`} className="font-semibold text-ink hover:text-brand hover:underline">
                        {p.order.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-ink-faint">–</span>
                    )}
                  </TD>
                  <TD className="whitespace-nowrap text-ink-muted">{p.storeName}</TD>
                  <TD className="tabular whitespace-nowrap text-ink-muted">{formatDateTime(p.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {payments.data && payments.data.items.length === 0 && (
            <EmptyState
              title="Tidak ada pembayaran"
              description={filter.query || filter.range || storeId ? "Coba ubah pencarian, outlet, atau rentang tanggal." : "Checkout Bayar Online dari aplikasi akan muncul di sini."}
            />
          )}
          {payments.data && (
            <Pagination page={payments.data.page} pageCount={pageCount(payments.data)} onChange={(p) => update({ page: String(p) })} />
          )}
        </Card>
      )}
    </>
  );
}
