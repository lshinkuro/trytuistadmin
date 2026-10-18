"use client";

import { useState } from "react";
import type { OrderDetail, OrderStatus } from "@/domain/order/Order";
import { ORDER_STATUS_LABEL, requiresNote, STATUS_NOTE_MAX } from "@/domain/order/orderStatus";
import { AppError } from "@/domain/shared/errors";
import { formatRupiah } from "@/shared/lib/format";
import { Button, Dialog, Field, Textarea } from "../../components/ui";
import { useChangeOrderStatus } from "../../hooks/useOrders";

const COPY: Partial<Record<OrderStatus, { title: string; confirm: string; body: string }>> = {
  COMPLETED: {
    title: "Tandai pesanan sukses",
    confirm: "Tandai sukses",
    body: "Pesanan dianggap selesai dan masuk ke penjualan. Status ini tidak bisa diubah lagi.",
  },
  FAILED: {
    title: "Tandai pesanan gagal",
    confirm: "Tandai gagal",
    body: "Pelanggan melihat alasan di riwayat pesanannya. Voucher dikembalikan dan stok terjual dikurangi.",
  },
  CANCELLED: {
    title: "Batalkan pesanan",
    confirm: "Batalkan pesanan",
    body: "Pelanggan melihat alasan di riwayat pesanannya. Voucher dikembalikan dan stok terjual dikurangi.",
  },
};

export function ChangeStatusDialog({
  order,
  target,
  onClose,
}: {
  order: OrderDetail;
  target: OrderStatus | null;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const change = useChangeOrderStatus();
  const fieldError = change.error instanceof AppError ? change.error.fieldErrors.note : undefined;
  const generalError = change.error instanceof AppError && !fieldError ? change.error.message : undefined;

  const close = () => {
    setNote("");
    change.reset();
    onClose();
  };

  if (!target) return <Dialog open={false} onClose={close} title="">{null}</Dialog>;

  const copy = COPY[target] ?? {
    title: `Ubah status ke ${ORDER_STATUS_LABEL[target]}`,
    confirm: `Ubah ke ${ORDER_STATUS_LABEL[target]}`,
    body: "Pelanggan melihat status baru di aplikasi.",
  };
  const needsNote = requiresNote(target);
  const variant = target === "FAILED" || target === "CANCELLED" ? "danger" : target === "COMPLETED" ? "success" : "primary";

  return (
    <Dialog
      open
      onClose={close}
      title={copy.title}
      description={
        <>
          {order.orderNumber} · {order.customer.name} · <span className="tabular">{formatRupiah(order.total)}</span>
        </>
      }
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Kembali
          </Button>
          <Button
            variant={variant}
            isLoading={change.isPending}
            onClick={() =>
              change.mutate({ orderId: order.id, status: target, note }, { onSuccess: close })
            }
          >
            {copy.confirm}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">{copy.body}</p>
        <Field
          label={needsNote ? "Alasan (dilihat pelanggan)" : "Catatan (opsional)"}
          error={fieldError}
          hint={`${note.length}/${STATUS_NOTE_MAX}`}
        >
          <Textarea
            value={note}
            maxLength={STATUS_NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            placeholder={needsNote ? "Contoh: Stok nasi goreng habis" : "Contoh: Diantar kurir outlet"}
            autoFocus
          />
        </Field>
        {generalError && (
          <p role="alert" className="text-sm text-danger">
            {generalError}
          </p>
        )}
      </div>
    </Dialog>
  );
}
