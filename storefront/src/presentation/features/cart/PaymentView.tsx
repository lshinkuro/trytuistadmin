"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { ErrorState } from "../../components/common/States";
import { Button, Card, Skeleton } from "../../components/ui";
import { useCancelPayment, usePayment } from "../../hooks/useShopData";
import { useShop } from "../../providers/ShopProvider";

// Halaman Midtrans dibuka di tab baru; tab ini polling status sampai final (STOREFRONT_PLAN §2).
export function PaymentView({ id }: { id: string }) {
  const payment = usePayment(id);
  const cancel = useCancelPayment();
  const router = useRouter();
  const { clear } = useShop();
  const p = payment.data;

  useEffect(() => {
    if (p?.status === "PAID" && p.orderId) {
      clear();
      router.replace(`/pesanan/${p.orderId}?baru=1`);
    }
  }, [p, clear, router]);

  if (payment.isError) return <ErrorState error={payment.error} onRetry={() => payment.refetch()} />;
  if (!p) return <Skeleton className="h-64 w-full" />;

  const finished = p.status !== "PENDING";
  return (
    <Card className="flex flex-col items-center gap-4 p-6 text-center">
      <span className="text-sm text-ink-muted">Total pembayaran</span>
      <span className="tabular text-3xl font-extrabold">{formatRupiah(p.amount)}</span>
      {p.status === "PENDING" && (
        <>
          <span className="text-sm text-ink-muted">Bayar sebelum {formatDateTime(p.expiresAt)}</span>
          {p.redirectUrl && (
            <a href={p.redirectUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button size="lg" className="w-full">
                <ExternalLink aria-hidden /> Bayar sekarang
              </Button>
            </a>
          )}
          <span className="flex items-center gap-2 text-sm text-ink-muted">
            <span aria-hidden className="size-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
            Menunggu pembayaran… halaman ini otomatis lanjut setelah lunas.
          </span>
          <Button variant="ghost" className="text-danger" isLoading={cancel.isPending} onClick={() => cancel.mutate(p.id)}>
            Batalkan pembayaran
          </Button>
        </>
      )}
      {p.status === "PAID" && <span className="font-semibold text-success">Pembayaran berhasil, membuka pesanan…</span>}
      {finished && p.status !== "PAID" && (
        <>
          <span className="font-semibold text-danger">
            {p.status === "EXPIRED" ? "Waktu pembayaran habis" : p.status === "CANCELLED" ? "Pembayaran dibatalkan" : "Pembayaran gagal"}
          </span>
          {p.statusMessage && <span className="text-sm text-ink-muted">{p.statusMessage}</span>}
          <Link href="/keranjang" className="font-semibold text-brand">
            Kembali ke keranjang
          </Link>
        </>
      )}
    </Card>
  );
}
