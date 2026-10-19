"use client";

import { MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { lineKey } from "@/domain/cart/Cart";
import type { QuoteRequest } from "@/domain/order/Order";
import { AppError } from "@/domain/shared/errors";
import { formatRupiah } from "@/shared/lib/format";
import { EmptyState } from "../../components/common/States";
import { Button, Card, Select, Skeleton, Switch } from "../../components/ui";
import { useAddresses, useCheckout, useDebounced, useOutlet, usePaymentMethods, useQuote } from "../../hooks/useShopData";
import { useShop } from "../../providers/ShopProvider";
import { QuantityStepper, Row } from "../shop/common";

const newKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export function CartView() {
  const { cart, setQty, clear, rules, ready } = useShop();
  const { storeId, selected: outlet } = useOutlet();
  const addresses = useAddresses();
  const methods = usePaymentMethods();
  const router = useRouter();
  const checkout = useCheckout();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [useFreeDelivery, setUseFreeDelivery] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Default = alamat & metode utama user.
  useEffect(() => {
    if (addressId === null && addresses.data?.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- default dari data server
      setAddressId((addresses.data.find((a) => a.isDefault) ?? addresses.data[0])!.id);
    }
  }, [addresses.data, addressId]);
  useEffect(() => {
    const enabled = methods.data?.methods.filter((m) => m.isEnabled) ?? [];
    if (paymentId === null && enabled.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- default dari data server
      setPaymentId((enabled.find((m) => m.id === methods.data?.defaultId) ?? enabled[0])!.id);
    }
  }, [methods.data, paymentId]);

  const request: QuoteRequest | null = useMemo(
    () =>
      cart.length === 0
        ? null
        : {
            storeId,
            addressId,
            useFreeDelivery,
            items: cart.map((i) => ({ productId: i.productId, optionId: i.optionId, quantity: i.quantity, note: i.note })),
          },
    [cart, storeId, addressId, useFreeDelivery],
  );
  // Tap +/− beruntun → satu quote; hasil terakhir yang dipakai (query key = isi request).
  const debounced = useDebounced(request, 300);
  const quote = useQuote(debounced);
  const isStale = debounced !== request || quote.isFetching;

  // Idempotency-Key dipakai ulang selama isi checkout sama (retry tidak membuat pesanan ganda).
  const [idemKey, setIdemKey] = useState(newKey);
  const [keyFor, setKeyFor] = useState("");
  const signature = JSON.stringify({ request, paymentId });
  if (signature !== keyFor) {
    setKeyFor(signature);
    setIdemKey(newKey());
  }

  // Kupon habis / fitur dimatikan → toggle mati & hitung ulang tanpa kupon.
  const quoteError = quote.error instanceof AppError ? quote.error : null;
  useEffect(() => {
    if (quoteError && quoteError.type.startsWith("FREE_DELIVERY") && useFreeDelivery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reaksi atas penolakan server
      setUseFreeDelivery(false);
      setNotice(quoteError.message);
    }
  }, [quoteError, useFreeDelivery]);

  if (!ready) return <Skeleton className="h-96 w-full" />;
  if (cart.length === 0) {
    return (
      <EmptyState
        title="Keranjang masih kosong"
        description="Pilih menu favoritmu dulu."
        action={
          <Link href="/menu" className="font-semibold text-brand">
            Lihat menu
          </Link>
        }
      />
    );
  }

  const q = quote.data;
  const coupon = q?.freeDelivery;
  const needsAddress = addresses.data?.length === 0;
  const canPay = !!q && !isStale && !quoteError && !needsAddress && !checkout.isPending;
  const isOnline = methods.data?.methods.find((m) => m.id === paymentId)?.type !== "COD";

  const submit = () => {
    if (!request) return;
    checkout.mutate(
      { req: { ...request, paymentMethodId: paymentId }, idempotencyKey: idemKey },
      {
        onSuccess: (res) => {
          if (res.next === "ORDER") {
            clear();
            router.push(`/pesanan/${res.orderId}?baru=1`);
          } else {
            router.push(`/bayar/${res.payment.id}`);
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <h1 className="text-xl font-extrabold">Keranjang</h1>

      <Card className="flex flex-col gap-2 p-4">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <MapPin className="size-4 text-brand" aria-hidden /> Antar ke
        </span>
        {addresses.isPending ? (
          <Skeleton className="h-10 w-full" />
        ) : needsAddress ? (
          <p className="text-sm">
            Belum ada alamat.{" "}
            <Link href="/akun?alamat=baru" className="font-semibold text-brand">
              Tambah alamat
            </Link>
          </p>
        ) : (
          <Select value={addressId ?? ""} onChange={(e) => setAddressId(e.target.value)} aria-label="Alamat pengiriman">
            {addresses.data?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} · {a.address}
              </option>
            ))}
          </Select>
        )}
        {outlet && <span className="text-xs text-ink-muted">Dikirim dari {outlet.name}</span>}
      </Card>

      <Card className="divide-y divide-line">
        {cart.map((i) => (
          <div key={lineKey(i)} className="flex gap-3 p-3">
            {i.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.imageUrl} alt="" className="size-16 shrink-0 rounded-control object-cover" />
            ) : (
              <span className="size-16 shrink-0 rounded-control bg-surface-muted" />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold">{i.name}</span>
              {i.optionName && <span className="text-xs text-ink-muted">{i.optionName}</span>}
              {i.note && <span className="text-xs text-ink-muted italic">“{i.note}”</span>}
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="tabular text-sm font-semibold">{formatRupiah(i.unitPrice * i.quantity)}</span>
                <QuantityStepper value={i.quantity} max={rules.maxQuantity} onChange={(n) => setQty(lineKey(i), n)} label={`Jumlah ${i.name}`} />
              </div>
            </div>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-2 p-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Pembayaran
          <Select value={paymentId ?? ""} onChange={(e) => setPaymentId(e.target.value)} disabled={!methods.data}>
            {methods.data?.methods.map((m) => (
              <option key={m.id} value={m.id} disabled={!m.isEnabled}>
                {m.name}
                {m.description ? ` · ${m.description}` : ""}
              </option>
            ))}
          </Select>
        </label>
        {coupon?.enabled && (
          <div className="flex items-start justify-between gap-3 pt-2">
            <span className="flex flex-col text-sm">
              <span className="flex items-center gap-1.5 font-semibold">
                <Ticket className="size-4 text-brand" aria-hidden /> Pakai kupon gratis ongkir
              </span>
              <span className="text-xs text-ink-muted">
                {coupon.remaining > 0 || coupon.applied
                  ? `Sisa ${coupon.remaining} dari ${coupon.weeklyQuota} kupon minggu ini`
                  : "Kupon minggu ini habis. Kuota baru mulai Senin."}
              </span>
            </span>
            <Switch
              label="Pakai kupon"
              hideLabel
              checked={useFreeDelivery}
              disabled={!(coupon.remaining > 0 || coupon.applied || useFreeDelivery)}
              onChange={(e) => {
                setNotice(null);
                setUseFreeDelivery(e.target.checked);
              }}
            />
          </div>
        )}
        {notice && <p className="text-xs text-ink-muted">{notice}</p>}
      </Card>

      <Card className="flex flex-col gap-1.5 p-4">
        {quoteError && !quoteError.type.startsWith("FREE_DELIVERY") ? (
          <div className="flex items-start justify-between gap-3">
            <p role="alert" className="text-sm text-danger">
              {quoteError.message}
            </p>
            <Button size="sm" variant="ghost" onClick={() => quote.refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : !q ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <Row label="Subtotal" value={formatRupiah(q.subtotal)} />
            <Row
              label={`Ongkos kirim${q.distanceKm != null ? ` (${q.distanceKm.toLocaleString("id-ID")} km)` : ""}`}
              value={coupon?.applied ? `Gratis (hemat ${formatRupiah(coupon.feeWaived)})` : q.deliveryFee === 0 ? "Gratis" : formatRupiah(q.deliveryFee)}
            />
            {q.discount > 0 && <Row label="Diskon" value={`−${formatRupiah(q.discount)}`} />}
            {q.eta && <Row label="Estimasi tiba" value={`${q.eta.min}–${q.eta.max} menit`} />}
            <div className="mt-1 border-t border-line pt-2">
              <Row label="Total" value={formatRupiah(q.total)} strong />
            </div>
          </>
        )}
      </Card>

      {checkout.error instanceof AppError && (
        <p role="alert" className="text-sm text-danger">
          {checkout.error.message}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-14 z-10 mx-auto flex max-w-xl flex-col gap-1 border-t border-line bg-surface px-4 py-3">
        {isOnline && <span className="text-center text-xs text-ink-muted">Pesanan dibuat setelah pembayaran berhasil.</span>}
        <Button size="lg" disabled={!canPay} isLoading={checkout.isPending} onClick={submit}>
          {isOnline ? "Bayar" : "Pesan sekarang"}
          {q && !isStale ? ` · ${formatRupiah(q.total)}` : ""}
        </Button>
      </div>
    </div>
  );
}
