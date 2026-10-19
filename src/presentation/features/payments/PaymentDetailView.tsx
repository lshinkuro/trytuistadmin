"use client";

import { ArrowLeft, Undo2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { isSuperAdmin } from "@/domain/auth/Auth";
import { paymentTypeLabel, type PaymentDetail } from "@/domain/payment/Payment";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { ErrorState } from "../../components/common/States";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "../../components/ui";
import { useCurrentAdmin } from "../../hooks/useAuth";
import { usePayment } from "../../hooks/usePayments";
import { PaymentStatusBadge, RefundStatusBadge } from "./PaymentStatusBadge";
import { RefundDialog } from "./RefundDialog";

const REFUND_STATUS_TEXT = { PENDING: "Diproses", SUCCEEDED: "Berhasil", FAILED: "Gagal" } as const;
const SOURCE_LABEL: Record<string, string> = {
  webhook: "Notifikasi Midtrans",
  status_api: "Cek status",
  client: "Cek dari aplikasi",
  sweeper: "Pengecekan otomatis",
};

export function PaymentDetailView({ id }: { id: string }) {
  const payment = usePayment(id);
  return (
    <div className="flex flex-col gap-6">
      <Link href="/payments" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Semua pembayaran
      </Link>
      {payment.isPending && <Skeleton className="h-96 w-full" />}
      {payment.isError && <ErrorState error={payment.error} onRetry={() => payment.refetch()} />}
      {payment.data && <PaymentDetailContent payment={payment.data} />}
    </div>
  );
}

function PaymentDetailContent({ payment }: { payment: PaymentDetail }) {
  const [refunding, setRefunding] = useState(false);
  const { data: admin } = useCurrentAdmin();
  // Refund khusus super admin (backend juga menolak 403).
  const canRefund = isSuperAdmin(admin) && payment.status === "PAID" && payment.refundableAmount > 0;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="tabular text-2xl font-extrabold tracking-tight">{payment.providerOrderId}</h1>
            <PaymentStatusBadge status={payment.status} />
            {payment.refundStatus && <RefundStatusBadge status={payment.refundStatus} />}
          </div>
          <p className="text-sm text-ink-muted">
            Dibuat {formatDateTime(payment.createdAt)} di outlet {payment.storeName}
          </p>
        </div>
        {canRefund && (
          <Button variant="outline" className="text-danger" onClick={() => setRefunding(true)}>
            <Undo2 aria-hidden /> Refund
          </Button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Isi pesanan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              <ul className="divide-y divide-dashed divide-line">
                {payment.items.map((item, i) => (
                  <li key={i} className="flex gap-4 py-3">
                    <span className="tabular w-8 shrink-0 font-bold">{item.quantity}×</span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold">{item.productName}</span>
                      {item.optionName && <span className="text-sm text-ink-muted">{item.optionName}</span>}
                    </div>
                    <span className="tabular font-semibold">{formatRupiah(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="tabular mt-2 flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
                <Row label="Subtotal" value={formatRupiah(payment.subtotal)} />
                <Row label="Ongkir" value={payment.deliveryFee === 0 ? "Gratis" : formatRupiah(payment.deliveryFee)} />
                {payment.discount > 0 && <Row label="Diskon" value={`−${formatRupiah(payment.discount)}`} />}
                <div className="mt-1 flex justify-between border-t border-line pt-2 text-base font-extrabold">
                  <dt>Dibayar</dt>
                  <dd>{formatRupiah(payment.amount)}</dd>
                </div>
                {payment.refundedAmount > 0 && <Row label="Sudah direfund" value={`−${formatRupiah(payment.refundedAmount)}`} />}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {payment.refunds.length === 0 ? (
                <p className="text-ink-muted">Belum ada refund.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {payment.refunds.map((r) => (
                    <li key={r.id} className="flex flex-col gap-0.5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular font-semibold">{formatRupiah(r.amount)}</span>
                        <Badge tone={r.status === "SUCCEEDED" ? "success" : r.status === "FAILED" ? "danger" : "warning"}>
                          {REFUND_STATUS_TEXT[r.status]}
                        </Badge>
                        <span className="text-ink-muted">{r.method === "MANUAL" ? "Manual" : "Lewat Midtrans"}</span>
                      </div>
                      <span>{r.reason}</span>
                      {r.message && <span className="text-danger">{r.message}</span>}
                      <span className="tabular text-xs text-ink-muted">
                        {formatDateTime(r.createdAt)}
                        {r.adminName ? ` oleh ${r.adminName}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat dari Midtrans</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {payment.events.length === 0 ? (
                <p className="text-ink-muted">Belum ada notifikasi atau cek status.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {payment.events.map((e, i) => (
                    <li key={i}>
                      <details className="rounded-control border border-line p-3">
                        <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                          <span className="font-semibold">{SOURCE_LABEL[e.source] ?? e.source}</span>
                          {e.providerStatus && <code className="text-xs">{e.providerStatus}</code>}
                          {e.signatureOk === false && <Badge tone="danger">Tanda tangan salah</Badge>}
                          <span className="tabular ml-auto text-xs text-ink-muted">{formatDateTime(e.createdAt)}</span>
                        </summary>
                        <pre className="mt-2 max-h-64 overflow-auto rounded-control bg-surface-muted p-2 text-xs">
                          {JSON.stringify(e.payload, null, 2)}
                        </pre>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-1.5 text-sm">
                <Row label="Metode" value={paymentTypeLabel(payment.paymentType)} />
                <Row label="Dibayar" value={payment.paidAt ? formatDateTime(payment.paidAt) : "–"} />
                <Row label="Batas bayar" value={formatDateTime(payment.expiresAt)} />
                {payment.providerTxnId && <Row label="ID transaksi" value={payment.providerTxnId} />}
              </dl>
              {payment.statusMessage && <p className="mt-3 rounded-control bg-surface-muted p-3 text-sm">{payment.statusMessage}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pelanggan & pesanan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0.5 text-sm">
              <span className="font-semibold">{payment.customer.name}</span>
              <a href={`mailto:${payment.customer.email}`} className="text-ink-muted hover:text-brand">
                {payment.customer.email}
              </a>
              {payment.customer.phone && <span className="text-ink-muted">{payment.customer.phone}</span>}
              <span className="mt-3">
                {payment.order ? (
                  <Link href={`/orders/${payment.order.id}`} className="font-semibold text-brand hover:underline">
                    Pesanan {payment.order.orderNumber}
                  </Link>
                ) : (
                  <span className="text-ink-muted">Belum ada pesanan (dibuat setelah lunas).</span>
                )}
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      {canRefund && <RefundDialog payment={payment} open={refunding} onClose={() => setRefunding(false)} />}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-ink-muted">
      <dt>{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
