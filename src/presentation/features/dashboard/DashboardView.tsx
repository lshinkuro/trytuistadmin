"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Dashboard } from "@/domain/dashboard/Dashboard";
import { validateDateRange, type DateRange } from "@/domain/shared/dateRange";
import { cn } from "@/shared/lib/cn";
import { formatChange, formatNumber, formatRupiah, formatShortDay } from "@/shared/lib/format";
import { ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "../../components/ui";
import { useDashboard } from "../../hooks/useDashboard";
import { PAYMENT_LABEL } from "../orders/OrderStatusBadge";
import { DailyBarChart } from "./DailyBarChart";
import { StoreSelect } from "../stores/StoreSelect";
import { DateRangeControl, presetRanges } from "./DateRangeControl";
import { StatusRail } from "./StatusRail";

/** Rentang tanggal & outlet disimpan di URL (?from&to&store) supaya bisa dibagikan. */
function useDashboardParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fallback = presetRanges().find((p) => p.key === "30d")!.range;
  const candidate = { from: params.get("from") ?? fallback.from, to: params.get("to") ?? fallback.to };
  const range = validateDateRange(candidate) ? fallback : candidate;
  const storeId = params.get("store") ?? "";
  const go = (r: DateRange, store: string) =>
    router.replace(`${pathname}?from=${r.from}&to=${r.to}${store ? `&store=${store}` : ""}`, { scroll: false });
  return {
    range,
    storeId,
    setRange: (r: DateRange) => go(r, storeId),
    setStoreId: (store: string) => go(range, store),
  };
}

export function DashboardView() {
  const { range, storeId, setRange, setStoreId } = useDashboardParams();
  const dashboard = useDashboard(range, storeId);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Penjualan dihitung dari pesanan yang sukses. Pembelian menghitung semua transaksi pelanggan, termasuk yang masih jalan, gagal, dan batal."
        actions={
          <>
            <StoreSelect value={storeId} onChange={setStoreId} className="h-9 w-48" />
            <DateRangeControl value={range} onChange={setRange} />
          </>
        }
      />
      {dashboard.isError && <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />}
      {dashboard.isPending && (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}
      {dashboard.data && (
        <div className={cn("flex flex-col gap-6 transition-opacity", dashboard.isPlaceholderData && "opacity-60")}>
          <StatusRail byStatus={dashboard.data.byStatus} range={dashboard.data.range} storeId={storeId} />
          <SalesAndPurchases data={dashboard.data} />
          {!storeId && dashboard.data.byStore.length > 1 && <StoreComparison data={dashboard.data} onSelect={setStoreId} />}
          <div className="grid gap-6 lg:grid-cols-2">
            <TopProducts data={dashboard.data} />
            <PaymentMix data={dashboard.data} />
          </div>
          <DailyTable data={dashboard.data} />
        </div>
      )}
    </>
  );
}

function Change({ pct, label }: { pct: number | null; label: string }) {
  if (pct === null) return <span className="text-[0.8125rem] text-ink-faint">Belum ada data {label}</span>;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn("tabular inline-flex items-center gap-1 text-[0.8125rem] font-semibold", up ? "text-success" : "text-danger")}>
      <Icon className="size-3.5" aria-hidden />
      {formatChange(pct)} <span className="font-normal text-ink-muted">vs {label}</span>
    </span>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd className="tabular text-base font-bold">{value}</dd>
      {hint && <dd className="text-xs text-ink-faint">{hint}</dd>}
    </div>
  );
}

function SalesAndPurchases({ data }: { data: Dashboard }) {
  const { sales, purchases } = data;
  return (
    <Card className="grid lg:grid-cols-2 lg:divide-x lg:divide-line">
      <section aria-labelledby="sales-title" className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 id="sales-title" className="text-[0.9375rem] font-bold">
            Penjualan
          </h2>
          <p className="tabular text-4xl font-extrabold tracking-tight">{formatRupiah(sales.revenue)}</p>
          <Change pct={sales.revenueChangePct} label="periode sebelumnya" />
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <Stat label="Pesanan sukses" value={formatNumber(sales.ordersCompleted)} />
          <Stat label="Rata-rata" value={formatRupiah(sales.averageOrderValue)} hint="per pesanan" />
          <Stat label="Item terjual" value={formatNumber(sales.itemsSold)} />
          <Stat label="Diskon voucher" value={formatRupiah(sales.discountTotal)} />
        </dl>
        <DailyBarChart
          data={data.daily}
          metric="revenue"
          colorClass="text-chart-sales"
          formatValue={formatRupiah}
          label="Grafik penjualan harian"
        />
      </section>
      <section aria-labelledby="purchases-title" className="flex flex-col gap-4 border-t border-line p-5 lg:border-t-0">
        <div className="flex flex-col gap-1">
          <h2 id="purchases-title" className="text-[0.9375rem] font-bold">
            Pembelian
          </h2>
          <p className="tabular text-4xl font-extrabold tracking-tight">
            {formatNumber(purchases.orders)} <span className="text-lg font-bold text-ink-muted">transaksi</span>
          </p>
          <Change pct={purchases.ordersChangePct} label="periode sebelumnya" />
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <Stat label="Pembeli" value={formatNumber(purchases.buyers)} hint={`${purchases.newBuyers} baru · ${purchases.repeatBuyers} lama`} />
          <Stat label="Tingkat sukses" value={`${purchases.successRatePct.toLocaleString("id-ID")}%`} />
          <Stat label="Gagal / batal" value={`${purchases.failed} / ${purchases.cancelled}`} />
          <Stat label="Nilai transaksi" value={formatRupiah(purchases.grossValue)} hint="semua status" />
        </dl>
        <DailyBarChart
          data={data.daily}
          metric="orders"
          colorClass="text-chart-purchases"
          formatValue={(v) => `${formatNumber(v)} transaksi`}
          label="Grafik transaksi harian"
        />
      </section>
    </Card>
  );
}

/** Batang horizontal satu warna: panjang = besaran, label & angka di teks (bukan warna). */
function BarList({ rows }: { rows: { key: string; label: string; value: number; display: string; sub?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{r.label}</span>
            <span className="tabular shrink-0 font-semibold">
              {r.display}
              {r.sub && <span className="ml-2 font-normal text-ink-muted">{r.sub}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-soft" aria-hidden>
            <div className="h-2 rounded-full bg-chart-sales" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Perbandingan outlet: panjang batang = penjualan; klik baris = lihat dashboard outlet itu. */
function StoreComparison({ data, onSelect }: { data: Dashboard; onSelect: (storeId: string) => void }) {
  const max = Math.max(1, ...data.byStore.map((s) => s.revenue));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perbandingan outlet</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="tabular w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-muted">
              <th className="pb-2 font-semibold">Outlet</th>
              <th className="pb-2 font-semibold">Penjualan</th>
              <th className="pb-2 text-right font-semibold">Transaksi</th>
              <th className="pb-2 text-right font-semibold">Tingkat sukses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.byStore.map((s) => (
              <tr key={s.storeId}>
                <td className="py-2.5 pr-4">
                  <button type="button" onClick={() => onSelect(s.storeId)} className="font-semibold hover:text-brand hover:underline">
                    {s.storeName}
                  </button>
                </td>
                <td className="w-1/2 py-2.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-neutral-soft" aria-hidden>
                      <div className="h-2 rounded-full bg-chart-sales" style={{ width: `${(s.revenue / max) * 100}%` }} />
                    </div>
                    <span className="w-28 shrink-0 text-right font-semibold">{formatRupiah(s.revenue)}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">{formatNumber(s.orders)}</td>
                <td className="py-2.5 text-right">{s.orders > 0 ? `${s.successRatePct.toLocaleString("id-ID")}%` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function TopProducts({ data }: { data: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu terlaris</CardTitle>
      </CardHeader>
      <CardContent>
        {data.topProducts.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada pesanan sukses di rentang ini.</p>
        ) : (
          <BarList
            rows={data.topProducts.map((p) => ({
              key: p.productId,
              label: p.productName,
              value: p.revenue,
              display: formatRupiah(p.revenue),
              sub: `${formatNumber(p.quantity)} porsi`,
            }))}
          />
        )}
      </CardContent>
    </Card>
  );
}

function PaymentMix({ data }: { data: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode pembayaran</CardTitle>
      </CardHeader>
      <CardContent>
        {data.paymentMethods.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada transaksi di rentang ini.</p>
        ) : (
          <BarList
            rows={data.paymentMethods.map((p) => ({
              key: p.method,
              label: PAYMENT_LABEL[p.method],
              value: p.count,
              display: `${formatNumber(p.count)} transaksi`,
              sub: formatRupiah(p.total),
            }))}
          />
        )}
      </CardContent>
    </Card>
  );
}

/** Tampilan tabel untuk data grafik (aksesibilitas & salin ke spreadsheet). */
function DailyTable({ data }: { data: Dashboard }) {
  return (
    <details className="rounded-panel border border-line bg-surface">
      <summary className="cursor-pointer px-5 py-3 text-sm font-semibold">Data harian ({data.daily.length} hari)</summary>
      <div className="overflow-x-auto border-t border-line">
        <table className="tabular w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-muted">
              <th className="px-5 py-2 font-semibold">Tanggal</th>
              <th className="px-5 py-2 text-right font-semibold">Penjualan</th>
              <th className="px-5 py-2 text-right font-semibold">Transaksi</th>
              <th className="px-5 py-2 text-right font-semibold">Sukses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...data.daily].reverse().map((d) => (
              <tr key={d.date}>
                <td className="px-5 py-2">{formatShortDay(d.date)}</td>
                <td className="px-5 py-2 text-right">{formatRupiah(d.revenue)}</td>
                <td className="px-5 py-2 text-right">{d.orders}</td>
                <td className="px-5 py-2 text-right">{d.ordersCompleted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
