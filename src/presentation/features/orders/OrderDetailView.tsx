"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { OrderDetail, OrderStatus } from "@/domain/order/Order";
import { paymentTypeLabel, REFUND_STATUS_LABEL, type RefundStatus } from "@/domain/payment/Payment";
import { ORDER_FLOW, ORDER_STATUS_LABEL, isFinal } from "@/domain/order/orderStatus";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { ErrorState } from "../../components/common/States";
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "../../components/ui";
import { useOrder } from "../../hooks/useOrders";
import { ChangeStatusDialog } from "./ChangeStatusDialog";
import { OrderStatusBadge, PAYMENT_LABEL } from "./OrderStatusBadge";

export function OrderDetailView({ id }: { id: string }) {
  const order = useOrder(id);
  return (
    <div className="flex flex-col gap-6">
      <Link href="/orders" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Semua pesanan
      </Link>
      {order.isPending && <Skeleton className="h-96 w-full" />}
      {order.isError && <ErrorState error={order.error} onRetry={() => order.refetch()} />}
      {order.data && <OrderDetailContent order={order.data} />}
    </div>
  );
}

function OrderDetailContent({ order }: { order: OrderDetail }) {
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const forward = order.nextStatuses.filter((s) => s !== "FAILED" && s !== "CANCELLED" && s !== "COMPLETED");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-ink-muted">
            Dibuat {formatDateTime(order.createdAt)} di outlet {order.storeName}
          </p>
        </div>
        {!isFinal(order.status) && (
          <div className="flex flex-wrap gap-2">
            {order.nextStatuses.includes("FAILED") && (
              <Button variant="outline" className="text-danger" onClick={() => setTarget("FAILED")}>
                <X aria-hidden /> Tandai gagal
              </Button>
            )}
            {order.nextStatuses.includes("COMPLETED") && (
              <Button variant="success" onClick={() => setTarget("COMPLETED")}>
                <Check aria-hidden /> Tandai sukses
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rincian pesanan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              <ul className="divide-y divide-dashed divide-line">
                {order.items.map((item, i) => (
                  <li key={`${item.productId}-${i}`} className="flex gap-4 py-3">
                    <span className="tabular w-8 shrink-0 font-bold text-ink">{item.quantity}×</span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold">{item.productName}</span>
                      {item.bundle.length > 0 && (
                        <ul className="my-0.5 text-sm text-ink">
                          {item.bundle.map((part) => (
                            <li key={part}>• {part}</li>
                          ))}
                        </ul>
                      )}
                      <span className="text-sm text-ink-muted">
                        {[item.optionName, item.note && `“${item.note}”`].filter(Boolean).join(" · ") ||
                          `${formatRupiah(item.unitPrice)} / item`}
                      </span>
                    </div>
                    <span className="tabular font-semibold">{formatRupiah(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="tabular mt-2 flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
                <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
                <Row
                  label={order.freeDeliveryCoupon ? "Ongkir (kupon gratis ongkir)" : "Ongkir"}
                  value={
                    order.freeDeliveryCoupon
                      ? `Gratis · ditanggung ${formatRupiah(order.deliveryFeeWaived)}`
                      : order.deliveryFee === 0
                        ? "Gratis"
                        : formatRupiah(order.deliveryFee)
                  }
                />
                {order.discount > 0 && (
                  <Row label={`Diskon${order.voucherCode ? ` (${order.voucherCode})` : ""}`} value={`−${formatRupiah(order.discount)}`} />
                )}
                <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-extrabold">
                  <dt>Total</dt>
                  <dd>{formatRupiah(order.total)}</dd>
                </div>
              </dl>
              {order.note && <p className="mt-4 rounded-control bg-surface-muted p-3 text-sm">Catatan pelanggan: {order.note}</p>}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pelanggan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 text-sm">
                <span className="font-semibold">{order.customer.name}</span>
                <a href={`mailto:${order.customer.email}`} className="text-ink-muted hover:text-brand">
                  {order.customer.email}
                </a>
                {order.customer.phone && <span className="text-ink-muted">{order.customer.phone}</span>}
                <span className="mt-3 font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</span>
                {order.payment ? (
                  <Link href={`/payments/${order.payment.id}`} className="text-brand hover:underline">
                    {paymentTypeLabel(order.payment.paymentType)} · {order.payment.providerOrderId}
                    {order.payment.refundStatus && ` · ${REFUND_STATUS_LABEL[order.payment.refundStatus as RefundStatus] ?? order.payment.refundStatus}`}
                  </Link>
                ) : (
                  order.paymentProvider && (
                    <span className="text-ink-muted">
                      {order.paymentProvider} {order.paymentAccountMasked}
                    </span>
                  )
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Antar ke</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 text-sm">
                {order.address ? (
                  <>
                    <span className="font-semibold">
                      {order.address.label} · {order.address.recipient}
                    </span>
                    <span className="text-ink-muted">{order.address.phone}</span>
                    <span>{order.address.address}</span>
                    {order.address.notes && <span className="text-ink-muted">{order.address.notes}</span>}
                    {order.distanceKm !== null && (
                      <span className="tabular mt-2 text-ink-muted">
                        {order.distanceKm.toLocaleString("id-ID")} km dari outlet
                        {order.eta && ` · estimasi ${order.eta.minMinutes}–${order.eta.maxMinutes} menit`}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-ink-muted">Alamat sudah dihapus pelanggan.</span>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <ol className="flex flex-col">
                {order.history.map((event, i) => (
                  <li key={`${event.status}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < order.history.length - 1 && <span aria-hidden className="absolute top-4 bottom-0 left-[5px] w-0.5 bg-line" />}
                    <span
                      aria-hidden
                      className={cn(
                        "relative mt-1.5 size-3 shrink-0 rounded-full ring-4 ring-surface",
                        event.status === "COMPLETED" ? "bg-success" : event.status === "FAILED" ? "bg-danger" : event.status === "CANCELLED" ? "bg-ink-faint" : "bg-warning",
                      )}
                    />
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold">{ORDER_STATUS_LABEL[event.status]}</span>
                      <span className="tabular text-xs text-ink-muted">
                        {formatDateTime(event.at)}
                        {event.changedBy ? ` oleh ${event.changedBy}` : ""}
                      </span>
                      {event.note && <span className="mt-1 text-ink">{event.note}</span>}
                    </div>
                  </li>
                ))}
              </ol>
              {forward.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-line pt-4">
                  <p className="text-[0.8125rem] font-semibold text-ink-muted">Majukan status</p>
                  <div className="flex flex-wrap gap-2">
                    {forward
                      .sort((a, b) => ORDER_FLOW.indexOf(a) - ORDER_FLOW.indexOf(b))
                      .map((s) => (
                        <Button key={s} size="sm" variant="outline" onClick={() => setTarget(s)}>
                          {ORDER_STATUS_LABEL[s]}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
              {order.nextStatuses.includes("CANCELLED") && (
                <button type="button" onClick={() => setTarget("CANCELLED")} className="w-fit text-sm font-semibold text-ink-muted hover:text-danger hover:underline">
                  Batalkan pesanan
                </button>
              )}
              {isFinal(order.status) && (
                <p className="text-sm text-ink-muted">Pesanan sudah {ORDER_STATUS_LABEL[order.status].toLowerCase()}; status tidak bisa diubah lagi.</p>
              )}
            </CardContent>
          </Card>
          {order.rating && (
            <Card>
              <CardHeader>
                <CardTitle>Nilai dari pelanggan</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <span className="text-lg font-bold" aria-label={`${order.rating.rating} dari 5`}>
                  {"★".repeat(order.rating.rating)}
                  <span className="text-line-strong">{"★".repeat(5 - order.rating.rating)}</span>
                </span>
                {order.rating.comment && <p className="mt-1">{order.rating.comment}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ChangeStatusDialog order={order} target={target} onClose={() => setTarget(null)} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-muted">
      <dt>{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
