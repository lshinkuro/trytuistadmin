"use client";

import { useState } from "react";
import {
  BANNER_ACTION_LABEL,
  BANNER_ACTIONS,
  needsTarget,
  type Banner,
  type BannerActionType,
  type BannerInput,
} from "@/domain/banner/Banner";
import { AppError } from "@/domain/shared/errors";
import { fromDateTimeLocal, toDateTimeLocal } from "@/shared/lib/format";
import { Button, Dialog, Field, Input, Select, Switch } from "../../components/ui";
import { useBanners, useSaveBanner } from "../../hooks/useBanners";
import { useCategories, useProducts } from "../../hooks/useProducts";

interface FormState {
  title: string;
  subtitle: string;
  imageUrl: string;
  actionType: BannerActionType;
  actionValue: string;
  startsAt: string;
  endsAt: string;
  sortOrder: string;
  isActive: boolean;
}

function initial(banner: Banner | null, nextSort: number): FormState {
  return {
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    imageUrl: banner?.imageUrl ?? "",
    actionType: banner?.actionType ?? "PRODUCT",
    actionValue: banner?.actionValue ?? "",
    startsAt: banner?.startsAt ? toDateTimeLocal(banner.startsAt) : "",
    endsAt: banner?.endsAt ? toDateTimeLocal(banner.endsAt) : "",
    sortOrder: String(banner?.sortOrder ?? nextSort),
    isActive: banner?.isActive ?? true,
  };
}

function toInput(f: FormState): BannerInput {
  return {
    title: f.title,
    subtitle: f.subtitle,
    imageUrl: f.imageUrl,
    actionType: f.actionType,
    actionValue: f.actionValue || null,
    startsAt: f.startsAt ? fromDateTimeLocal(f.startsAt) : null,
    endsAt: f.endsAt ? fromDateTimeLocal(f.endsAt) : null,
    sortOrder: f.sortOrder === "" ? Number.NaN : Number(f.sortOrder),
    isActive: f.isActive,
  };
}

/** `banner` null = banner baru. */
export function BannerFormDialog({ banner, onClose }: { banner: Banner | null; onClose: () => void }) {
  const all = useBanners();
  const nextSort = (all.data ?? []).reduce((max, b) => Math.max(max, b.sortOrder + 1), 1);
  const [form, setForm] = useState(() => initial(banner, nextSort));
  const save = useSaveBanner();
  const products = useProducts({ query: "", categoryId: "", availability: "all", storeId: "" });
  const categories = useCategories();
  const errors = save.error instanceof AppError ? save.error.fieldErrors : {};
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (save.error) save.reset();
    setForm((f) => ({ ...f, [key]: value }));
  };
  const showImage = form.imageUrl.startsWith("https://");

  return (
    <Dialog
      open
      onClose={onClose}
      title={banner ? "Ubah banner" : "Banner baru"}
      description="Tampil di carousel Beranda aplikasi, urutan kecil di depan."
      className="w-[min(40rem,calc(100vw-2rem))]"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button isLoading={save.isPending} onClick={() => save.mutate({ id: banner?.id ?? null, input: toInput(form) }, { onSuccess: onClose })}>
            {banner ? "Simpan perubahan" : "Buat banner"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative flex h-36 items-end overflow-hidden rounded-panel bg-surface-muted">
          {showImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          )}
          <div className="relative w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
            <p className="text-lg font-bold">{form.title || "Judul banner"}</p>
            <p className="text-sm opacity-90">{form.subtitle || "Subjudul"}</p>
          </div>
        </div>

        <Field label="Judul" error={errors.title} hint={`${form.title.length}/80`}>
          <Input value={form.title} maxLength={80} onChange={(e) => set("title", e.target.value)} placeholder="Paket Combo Hemat" autoFocus />
        </Field>
        <Field label="Subjudul" error={errors.subtitle} hint={`${form.subtitle.length}/120`}>
          <Input value={form.subtitle} maxLength={120} onChange={(e) => set("subtitle", e.target.value)} placeholder="Kopi + croissant mulai Rp 39rb" />
        </Field>
        <Field label="URL gambar (https)" error={errors.imageUrl}>
          <Input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/…" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Saat di-tap" error={errors.actionType}>
            <Select value={form.actionType} onChange={(e) => set("actionType", e.target.value as BannerActionType)}>
              {BANNER_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {BANNER_ACTION_LABEL[a]}
                </option>
              ))}
            </Select>
          </Field>
          {needsTarget(form.actionType) && (
            <Field label={form.actionType === "PRODUCT" ? "Menu tujuan" : "Kategori tujuan"} error={errors.actionValue}>
              <Select value={form.actionValue} onChange={(e) => set("actionValue", e.target.value)}>
                <option value="">Pilih…</option>
                {form.actionType === "PRODUCT"
                  ? products.data?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.dealPrice != null ? " · sedang promo" : ""}
                      </option>
                    ))
                  : categories.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
              </Select>
            </Field>
          )}
        </div>
        {form.actionType === "FREE_DELIVERY" && (
          <p className="text-sm text-ink-muted">
            Menampilkan penjelasan kupon gratis ongkir mingguan. Banner otomatis disembunyikan saat kupon dimatikan di menu Ongkir.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mulai tampil" hint="Kosong = sekarang" error={errors.startsAt}>
            <Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          </Field>
          <Field label="Berakhir" hint="Kosong = tanpa batas" error={errors.endsAt}>
            <Input type="datetime-local" value={form.endsAt} min={form.startsAt || undefined} onChange={(e) => set("endsAt", e.target.value)} />
          </Field>
        </div>
        <div className="grid items-end gap-4 sm:grid-cols-2">
          <Field label="Urutan" error={errors.sortOrder}>
            <Input inputMode="numeric" className="tabular" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Switch label="Aktif" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="mb-2" />
        </div>
        {save.error instanceof AppError && Object.keys(errors).length === 0 && (
          <p role="alert" className="text-sm text-danger">
            {save.error.message}
          </p>
        )}
      </div>
    </Dialog>
  );
}
