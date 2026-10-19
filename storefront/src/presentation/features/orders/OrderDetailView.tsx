"use client";

import { ArrowLeft, Printer, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { makeItem } from "@/domain/cart/Cart";
import { progressStep, statusLabel, type OrderDetail } from "@/domain/order/Order";
import { AppError } from "@/domain/shared/errors";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { ErrorState } from "../../components/common/States";
import { Button, Card, Dialog, Skeleton, Textarea } from "../../components/ui";
import { useCancelOrder, useOrder, useRateOrder } from "../../hooks/useShopData";
import { useShop } from "../../providers/ShopProvider";
import { Row } from "../shop/common";
import { StatusPill } from "./OrdersView";

const STEPS = ["Diterima", "Disiapkan", "Diantar", "Selesai"];
const timeOf = (d: Date) => new Intl.DateTimeFormat("id-ID", { timeStyle: "short", timeZone: "Asia/Jakarta" }).format(d);

export function OrderDetailView({ id }: { id: string }) {
  const order = useOrder(id);
  const isNew = useSearchParams().get("baru") === "1";
  return (
    <div className="flex flex-col gap-4">
      <Link href="/pesanan" className="flex w-fit items-center gap-1 text-sm font-semibold text-ink-muted print:hidden">
        <ArrowLeft className="size-4" aria-hidden /> Semua pesanan
      </Link>
      {isNew && <p className="rounded-panel bg-success-soft p-3 text-sm font-semibold text-success print:hidden">Pesanan diterima! 🎉</p>}
      {order.isError && <ErrorState error={order.error} onRetry={() => order.refetch()} />}
      {order.isPending && <Skeleton className="h-96 w-full" />}
      {order.data && <Detail order={order.data} />}
    </div>
  );
}

function Detail({ order }: { order: OrderDetail }) {
  const step = progressStep(order.status);
  const cancel = useCancelOrder();
  const rate = useRateOrder();
  const { add } = useShop();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const closingNote = [...order.history].reverse().find((h) => h.status === order.status)?.note;
  const arrival = step !== null && step < 3 && order.eta
    ? `${timeOf(new Date(order.createdAt.getTime() + order.eta.min * 60_000))}–${timeOf(new Date(order.createdAt.getTime() + order.eta.max * 60_000))}`
    : null;

  const reorder = () => {
    for (const i of order.items) {
      // unitPrice sudah termasuk varian; total resmi dihitung ulang quote di keranjang.
      const option = i.optionId ? { id: i.optionId, name: i.optionName ?? "", extraPrice: 0 } : null;
      add(makeItem({ id: i.productId, name: i.name, price: i.unitPrice, imageUrl: "" }, option, i.quantity, i.note));
    }
    router.push("/keranjang");
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold">{statusLabel(order.status)}</span>
            <span className="text-xs text-ink-muted">
              {order.number} · {formatDateTime(order.createdAt)}
            </span>
          </div>
          <StatusPill status={order.status} />
        </div>
        {arrival && <span className="text-sm font-semibold text-brand">Perkiraan tiba {arrival}</span>}
        {closingNote && <span className="text-sm text-ink-muted">{closingNote}</span>}
        {step !== null && (
          <div className="flex flex-col gap-1.5 print:hidden">
            <div className="flex gap-1">
              {STEPS.map((s, i) => (
                <span key={s} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-brand" : "bg-line")} />
              ))}
            </div>
            <div className="flex">
              {STEPS.map((s, i) => (
                <span key={s} className={cn("flex-1 text-center text-[0.6875rem]", i <= step ? "font-semibold text-ink" : "text-ink-faint")}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {order.refund && (
        <Card className="p-4 text-sm">
          <span className="font-semibold">
            {order.refund.status === "PENDING"
              ? "Pengembalian dana diproses"
              : order.refund.status === "PARTIAL"
                ? "Sebagian dana dikembalikan"
                : "Dana sudah dikembalikan"}
          </span>
          <p className="text-ink-muted">
            {order.refund.status === "PENDING"
              ? `Toko akan mengembalikan pembayaranmu ke ${order.paymentLabel}.`
              : `${formatRupiah(order.refund.amount)} sudah dikembalikan ke ${order.paymentLabel}.`}
          </p>
        </Card>
      )}

      <Card className="flex flex-col gap-1 p-4 text-sm">
        <span className="font-semibold">{order.storeName}</span>
        <span className="text-xs text-ink-muted">{order.storeAddress}</span>
        {order.address && <span className="mt-2">📍 {order.address}</span>}
        {order.distanceKm != null && <span className="text-xs text-ink-muted">{order.distanceKm.toLocaleString("id-ID")} km dari outlet</span>}
      </Card>

      <Card className="flex flex-col gap-3 p-4">
        <span className="font-semibold">Rincian pesanan</span>
        {order.items.map((i, idx) => (
          <div key={idx} className="flex gap-3 text-sm">
            <span className="tabular w-7 shrink-0 font-bold text-brand">{i.quantity}×</span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{i.name}</span>
              {i.optionName && <span className="text-xs text-ink-muted">{i.optionName}</span>}
              {i.bundle.map((b) => (
                <span key={b} className="text-xs text-ink-muted">
                  • {b}
                </span>
              ))}
              {i.note && <span className="text-xs text-ink-muted italic">“{i.note}”</span>}
            </div>
            <span className="tabular">{formatRupiah(i.subtotal)}</span>
          </div>
        ))}
        <div className="flex flex-col gap-1.5 border-t border-line pt-3">
          <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
          <Row
            label={order.freeDeliveryCoupon ? "Ongkir (kupon)" : "Ongkir"}
            value={order.freeDeliveryCoupon ? `Gratis (hemat ${formatRupiah(order.deliveryFeeWaived)})` : order.deliveryFee === 0 ? "Gratis" : formatRupiah(order.deliveryFee)}
          />
          {order.discount > 0 && <Row label={`Diskon${order.voucherCode ? ` (${order.voucherCode})` : ""}`} value={`−${formatRupiah(order.discount)}`} />}
          <Row label="Total" value={formatRupiah(order.total)} strong />
          <span className="text-xs text-ink-muted">Dibayar dengan {order.paymentLabel}</span>
        </div>
      </Card>

      {order.canRate && (
        <Card className="flex flex-col gap-2 p-4 print:hidden">
          <span className="font-semibold">Bagaimana pesananmu?</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} bintang`}>
                <Star className={cn("size-7", n <= rating ? "fill-warning text-warning" : "text-line-strong")} />
              </button>
            ))}
          </div>
          <Textarea value={comment} maxLength={500} onChange={(e) => setComment(e.target.value)} placeholder="Ceritakan pengalamanmu (opsional)" />
          {rate.error instanceof AppError && <p className="text-sm text-danger">{rate.error.message}</p>}
          <Button disabled={rating === 0} isLoading={rate.isPending} onClick={() => rate.mutate({ id: order.id, rating, comment })}>
            Kirim penilaian
          </Button>
        </Card>
      )}
      {order.rating && (
        <Card className="p-4 text-sm">
          Penilaianmu: <span className="text-warning">{"★".repeat(order.rating)}</span>
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-4 print:hidden">
        <span className="font-semibold">Riwayat status</span>
        {[...order.history].reverse().map((h, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", i === 0 ? "bg-brand" : "bg-line-strong")} />
            <div className="flex flex-col">
              <span className={cn(i === 0 && "font-semibold")}>{statusLabel(h.status)}</span>
              {h.note && <span className="text-xs text-ink-muted">{h.note}</span>}
              <span className="text-xs text-ink-faint">{formatDateTime(h.at)}</span>
            </div>
          </div>
        ))}
      </Card>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer aria-hidden /> Struk
        </Button>
        {order.canCancel && (
          <Button variant="outline" className="text-danger" onClick={() => setConfirming(true)}>
            Batalkan pesanan
          </Button>
        )}
        {(order.status === "COMPLETED" || order.status === "CANCELLED" || order.status === "FAILED") && (
          <Button className="flex-1" onClick={reorder}>
            Pesan lagi
          </Button>
        )}
      </div>
      {cancel.error instanceof AppError && <p className="text-sm text-danger">{cancel.error.message}</p>}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Batalkan pesanan ini?"
        description="Outlet belum memproses pesananmu. Voucher & kupon yang dipakai akan kembali."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Tidak jadi
            </Button>
            <Button variant="danger" isLoading={cancel.isPending} onClick={() => cancel.mutate(order.id, { onSettled: () => setConfirming(false) })}>
              Ya, batalkan
            </Button>
          </>
        }
      >
        {null}
      </Dialog>
    </div>
  );
}
