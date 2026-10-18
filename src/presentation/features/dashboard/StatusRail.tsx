import Link from "next/link";
import type { Dashboard } from "@/domain/dashboard/Dashboard";
import type { OrderStatus } from "@/domain/order/Order";
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/domain/order/orderStatus";
import type { DateRange } from "@/domain/shared/dateRange";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";

/**
 * Rel status pesanan: alur Menunggu → … → Sukses digambar sebagai satu rel, Gagal & Batal
 * sebagai cabang keluar. Tiap stasiun membuka daftar pesanan dengan filter yang sama.
 */
export function StatusRail({ byStatus, range, storeId = "" }: { byStatus: Dashboard["byStatus"]; range: DateRange; storeId?: string }) {
  const count = (s: OrderStatus) => byStatus.find((x) => x.status === s)?.count ?? 0;
  const href = (s: OrderStatus) =>
    `/orders?status=${s}&from=${range.from}&to=${range.to}${storeId ? `&store=${storeId}` : ""}`;

  return (
    <section aria-labelledby="rail-title" className="rounded-panel border border-line bg-surface px-5 pt-4 pb-5">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="rail-title" className="text-[0.9375rem] font-bold">
          Perjalanan pesanan
        </h2>
        <p className="text-[0.8125rem] text-ink-muted">Pesanan yang dibuat dalam rentang ini, menurut status sekarang.</p>
      </div>
      <div className="-mx-5 overflow-x-auto px-5">
        <ol className="flex min-w-[40rem] items-start">
          {ORDER_FLOW.map((status, i) => {
            const n = count(status);
            const done = status === "COMPLETED";
            return (
              <li key={status} className="relative flex flex-1 flex-col items-center">
                {i > 0 && <span aria-hidden className="absolute top-7 right-1/2 h-1.5 w-full -translate-y-1/2 bg-line" />}
                <Link
                  href={href(status)}
                  className={cn(
                    "tabular relative z-10 flex size-14 items-center justify-center rounded-full border-4 border-surface text-lg font-extrabold transition-transform hover:scale-105",
                    n === 0
                      ? "bg-neutral-soft text-ink-faint"
                      : done
                        ? "bg-success text-white dark:text-canvas"
                        : "bg-warning-soft text-warning ring-2 ring-warning/40",
                  )}
                  aria-label={`${ORDER_STATUS_LABEL[status]}: ${n} pesanan`}
                >
                  {formatNumber(n)}
                </Link>
                <span className={cn("mt-2 text-sm font-semibold", n === 0 ? "text-ink-faint" : "text-ink")}>
                  {ORDER_STATUS_LABEL[status]}
                </span>
              </li>
            );
          })}
          <li aria-hidden className="mx-2 mt-3 h-8 w-px self-start bg-line-strong" />
          {(["FAILED", "CANCELLED"] as const).map((status) => {
            const n = count(status);
            return (
              <li key={status} className="flex w-20 shrink-0 flex-col items-center">
                <Link
                  href={href(status)}
                  className={cn(
                    "tabular flex size-14 items-center justify-center rounded-full border-2 border-dashed text-lg font-extrabold transition-transform hover:scale-105",
                    n === 0
                      ? "border-line-strong text-ink-faint"
                      : status === "FAILED"
                        ? "border-danger bg-danger-soft text-danger"
                        : "border-ink-faint bg-neutral-soft text-ink-muted",
                  )}
                  aria-label={`${ORDER_STATUS_LABEL[status]}: ${n} pesanan`}
                >
                  {formatNumber(n)}
                </Link>
                <span className={cn("mt-2 text-sm font-semibold", n === 0 ? "text-ink-faint" : "text-ink")}>
                  {ORDER_STATUS_LABEL[status]}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
