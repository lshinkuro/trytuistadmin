"use client";

import { useMemo, useState } from "react";
import { discountPercent, type Deal, type DealInput } from "@/domain/deal/Deal";
import { AppError } from "@/domain/shared/errors";
import { formatRupiah, fromDateTimeLocal, toDateTimeLocal } from "@/shared/lib/format";
import { Button, Dialog, Field, Input, Select, Switch } from "../../components/ui";
import { useSaveDeal } from "../../hooks/useDeals";
import { useProducts } from "../../hooks/useProducts";

interface FormState {
  productId: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  dealPrice: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  showAsPopup: boolean;
  sortOrder: string;
}

function initialState(deal: Deal | null): FormState {
  const now = new Date();
  return {
    productId: deal?.productId ?? "",
    title: deal?.title ?? "",
    subtitle: deal?.subtitle ?? "",
    badge: deal?.badge ?? "",
    imageUrl: deal?.imageUrl ?? "",
    dealPrice: deal ? String(deal.dealPrice) : "",
    startsAt: toDateTimeLocal(deal?.startsAt ?? now),
    endsAt: toDateTimeLocal(deal?.endsAt ?? new Date(now.getTime() + 7 * 86_400_000)),
    isActive: deal?.isActive ?? true,
    showAsPopup: deal?.showAsPopup ?? false,
    sortOrder: String(deal?.sortOrder ?? 0),
  };
}

export function DealFormDialog({ deal, onClose }: { deal: Deal | null; onClose: () => void }) {
  const [form, setForm] = useState(() => initialState(deal));
  const products = useProducts({ query: "", categoryId: "", availability: "all" });
  const save = useSaveDeal();
  const errors = save.error instanceof AppError ? save.error.fieldErrors : {};
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const product = useMemo(() => products.data?.find((p) => p.id === form.productId) ?? null, [products.data, form.productId]);
  const dealPrice = Number(form.dealPrice || 0);
  const pct = product ? discountPercent(product.price, dealPrice) : 0;

  const submit = () => {
    const input: DealInput = {
      productId: form.productId,
      title: form.title,
      subtitle: form.subtitle,
      badge: form.badge,
      imageUrl: form.imageUrl.trim(),
      dealPrice,
      startsAt: fromDateTimeLocal(form.startsAt),
      endsAt: fromDateTimeLocal(form.endsAt),
      isActive: form.isActive,
      showAsPopup: form.showAsPopup,
      sortOrder: Number(form.sortOrder || 0),
    };
    save.mutate({ id: deal?.id, input, normalPrice: product?.price ?? null }, { onSuccess: onClose });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={deal ? "Ubah promo" : "Promo baru"}
      description="Harga promo langsung dipakai di aplikasi selama periodenya berjalan, termasuk saat checkout."
      className="w-[min(40rem,calc(100vw-2rem))]"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} isLoading={save.isPending}>
            {deal ? "Simpan promo" : "Buat promo"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Produk" error={errors.productId} className="sm:col-span-2">
          <Select value={form.productId} onChange={(e) => set("productId", e.target.value)}>
            <option value="">Pilih produk…</option>
            {products.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatRupiah(p.price)}
                {p.isAvailable ? "" : " (habis)"}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Harga promo (Rp)"
          error={errors.dealPrice}
          hint={product ? (pct > 0 ? `Hemat ${pct}% dari ${formatRupiah(product.price)}` : `Harus di bawah ${formatRupiah(product.price)}`) : undefined}
        >
          <Input inputMode="numeric" className="tabular" value={form.dealPrice} onChange={(e) => set("dealPrice", e.target.value.replace(/\D/g, ""))} />
        </Field>
        <Field label="Badge" hint={`Kosong = "HEMAT ${pct || "…"}%"`} error={errors.badge}>
          <Input value={form.badge} maxLength={30} onChange={(e) => set("badge", e.target.value)} placeholder="Opsional" />
        </Field>
        <Field label="Judul" error={errors.title} className="sm:col-span-2">
          <Input value={form.title} maxLength={120} onChange={(e) => set("title", e.target.value)} placeholder="Nasi Goreng Spesial cuma 19rb!" />
        </Field>
        <Field label="Subjudul" error={errors.subtitle} className="sm:col-span-2">
          <Input value={form.subtitle} maxLength={200} onChange={(e) => set("subtitle", e.target.value)} placeholder="Selama persediaan ada." />
        </Field>
        <Field label="Mulai (WIB)" error={errors.startsAt}>
          <Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
        </Field>
        <Field label="Selesai (WIB)" error={errors.endsAt}>
          <Input type="datetime-local" value={form.endsAt} min={form.startsAt} onChange={(e) => set("endsAt", e.target.value)} />
        </Field>
        <Field label="URL gambar" error={errors.imageUrl} hint="Kosong = foto produk." className="sm:col-span-2">
          <Input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/…" />
        </Field>
        <Field label="Urutan" hint="Angka kecil tampil dulu." error={errors.sortOrder}>
          <Input inputMode="numeric" className="tabular" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value.replace(/\D/g, ""))} />
        </Field>
        <div className="flex flex-col justify-center gap-3">
          <Switch label="Aktif" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
          <Switch label="Tampilkan sebagai popup di Beranda" checked={form.showAsPopup} onChange={(e) => set("showAsPopup", e.target.checked)} />
        </div>
        {save.error instanceof AppError && Object.keys(errors).length === 0 && (
          <p role="alert" className="text-sm text-danger sm:col-span-2">
            {save.error.message}
          </p>
        )}
      </div>
    </Dialog>
  );
}
