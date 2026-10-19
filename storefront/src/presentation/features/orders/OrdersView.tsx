"use client";

import Link from "next/link";
import { useState } from "react";
import { isFinished, statusLabel } from "@/domain/order/Order";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "../../components/common/States";
import { Button, Card, Skeleton } from "../../components/ui";
import { useOrders } from "../../hooks/useShopData";

export function StatusPill({ status }: { status: string }) {
  const tone = status === "COMPLETED" ? "bg-success-soft text-success" : status === "CANCELLED" || status === "FAILED" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning";
  return <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", tone)}>{statusLabel(status)}</span>;
}

export function OrdersView() {
  const [page, setPage] = useState(1);
  const orders = useOrders(page);
  if (orders.isError) return <ErrorState error={orders.error} onRetry={() => orders.refetch()} />;
  if (!orders.data) return <Skeleton className="h-64 w-full" />;
  const { items, total } = orders.data;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-extrabold">Pesanan</h1>
      {items.length === 0 && (
        <EmptyState title="Belum ada pesanan" description="Pesanan yang kamu buat akan muncul di sini." action={<Link href="/menu" className="font-semibold text-brand">Pesan sekarang</Link>} />
      )}
      {items.map((o) => (
        <Link key={o.id} href={`/pesanan/${o.id}`}>
          <Card className="flex flex-col gap-1 p-4 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold">{o.title}</span>
              <StatusPill status={o.status} />
            </div>
            <span className="text-xs text-ink-muted">
              {o.storeName} · {formatDateTime(o.createdAt)}
            </span>
            <span className="tabular text-sm">
              {o.quantity} item · <b>{formatRupiah(o.total)}</b>
              {o.canRate && <span className="ml-2 text-brand">· Beri nilai</span>}
              {!isFinished(o.status) && <span className="ml-2 text-warning">· Berjalan</span>}
            </span>
          </Card>
        </Link>
      ))}
      {total > page * 20 && (
        <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
          Muat lebih banyak
        </Button>
      )}
      {page > 1 && (
        <Button variant="ghost" onClick={() => setPage(1)}>
          Kembali ke terbaru
        </Button>
      )}
    </div>
  );
}
