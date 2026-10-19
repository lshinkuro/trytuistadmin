"use client";

import { useState } from "react";
import { REFUND_REASON_MAX, type PaymentDetail } from "@/domain/payment/Payment";
import { AppError } from "@/domain/shared/errors";
import { formatRupiah } from "@/shared/lib/format";
import { Button, Dialog, Field, Input, Switch, Textarea } from "../../components/ui";
import { useRefundPayment } from "../../hooks/usePayments";

export function RefundDialog({ payment, open, onClose }: { payment: PaymentDetail; open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  // Channel tanpa Refund API (VA / gerai) hanya bisa dicatat manual.
  const [manual, setManual] = useState(!payment.canRefundOnline);
  const refund = useRefundPayment();
  const fieldErrors = refund.error instanceof AppError ? refund.error.fieldErrors : {};
  const generalError =
    refund.error instanceof AppError && !fieldErrors.reason && !fieldErrors.amount ? refund.error.message : undefined;

  const close = () => {
    setAmount("");
    setReason("");
    setManual(!payment.canRefundOnline);
    refund.reset();
    onClose();
  };

  const parsed = amount.trim() === "" ? null : Number(amount.replace(/\D/g, ""));
  const shown = parsed ?? payment.refundableAmount;

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Refund pembayaran"
      description={
        <>
          {payment.providerOrderId} · {payment.customer.name} · sisa{" "}
          <span className="tabular">{formatRupiah(payment.refundableAmount)}</span>
        </>
      }
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Kembali
          </Button>
          <Button
            variant="danger"
            isLoading={refund.isPending}
            onClick={() =>
              refund.mutate(
                { input: { paymentId: payment.id, amount: parsed, reason, manual }, refundable: payment.refundableAmount },
                { onSuccess: close },
              )
            }
          >
            {manual ? "Catat refund" : `Refund ${formatRupiah(shown)}`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          {manual
            ? "Pastikan dana sudah kamu transfer balik ke pelanggan. Sistem hanya mencatatnya; Midtrans tidak dipanggil."
            : "Dana dikembalikan lewat Midtrans ke metode bayar pelanggan. Status pesanan tidak berubah otomatis."}
        </p>
        <Field label="Jumlah (kosongkan = seluruh sisa)" error={fieldErrors.amount}>
          <Input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={String(payment.refundableAmount)}
            className="tabular"
          />
        </Field>
        <Field label="Alasan" error={fieldErrors.reason} hint={`${reason.length}/${REFUND_REASON_MAX}`}>
          <Textarea
            value={reason}
            maxLength={REFUND_REASON_MAX}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Menu habis, pesanan dibatalkan outlet"
          />
        </Field>
        <Switch
          label="Refund manual (sudah ditransfer sendiri)"
          checked={manual}
          disabled={!payment.canRefundOnline}
          onChange={(e) => setManual(e.target.checked)}
        />
        {!payment.canRefundOnline && (
          <p className="text-[0.8125rem] text-ink-muted">Metode ini tidak bisa direfund lewat Midtrans, jadi hanya bisa dicatat manual.</p>
        )}
        {generalError && (
          <p role="alert" className="text-sm text-danger">
            {generalError}
          </p>
        )}
      </div>
    </Dialog>
  );
}
