"use client";

import { ImageOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { MAX_BUNDLE_ITEMS, MAX_OPTIONS, type Product, type ProductInput } from "@/domain/product/Product";
import { AppError } from "@/domain/shared/errors";
import { formatRupiah } from "@/shared/lib/format";
import { Button, Dialog, Field, Input, Label, Select, Switch, Textarea } from "../../components/ui";
import { useCategories, useCreateProduct, useProducts, useUpdateProduct } from "../../hooks/useProducts";

interface OptionRow {
  key: string;
  id?: string;
  name: string;
  extraPrice: string;
}

interface BundleRow {
  key: string;
  productId: string;
  optionId: string;
  quantity: string;
}

interface FormState {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  options: OptionRow[];
  bundle: BundleRow[];
}

let rowSeq = 0;
const newBundleRow = (b?: { productId: string; optionId: string | null; quantity: number }): BundleRow => ({
  key: `bundle-${++rowSeq}`,
  productId: b?.productId ?? "",
  optionId: b?.optionId ?? "",
  quantity: b ? String(b.quantity) : "1",
});
const newRow = (o?: { id?: string; name: string; extraPrice: number }): OptionRow => ({
  key: `row-${++rowSeq}`,
  id: o?.id,
  name: o?.name ?? "",
  extraPrice: o ? String(o.extraPrice) : "0",
});

function initialState(product: Product | null, defaultCategory: string): FormState {
  return {
    categoryId: product?.categoryId ?? defaultCategory,
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    imageUrl: product?.imageUrl ?? "",
    isAvailable: product?.isAvailable ?? true,
    isBestSeller: product?.isBestSeller ?? false,
    options: product?.options.map((o) => newRow(o)) ?? [],
    bundle: product?.bundleItems.map((b) => newBundleRow(b)) ?? [],
  };
}

const digits = (v: string) => v.replace(/\D/g, "");

function toInput(form: FormState): ProductInput {
  return {
    categoryId: form.categoryId,
    name: form.name,
    description: form.description,
    price: form.price === "" ? Number.NaN : Number(form.price),
    imageUrl: form.imageUrl,
    isAvailable: form.isAvailable,
    isBestSeller: form.isBestSeller,
    options: form.options.map((o) => ({ id: o.id, name: o.name, extraPrice: Number(o.extraPrice || 0) })),
    bundleItems: form.bundle.map((b) => ({ productId: b.productId, optionId: b.optionId || null, quantity: Number(b.quantity || 0) })),
  };
}

/** Hanya field yang berubah yang dikirim saat ubah menu. */
function changes(product: Product, input: ProductInput): Partial<ProductInput> {
  const out: Partial<ProductInput> = {};
  if (input.categoryId !== product.categoryId) out.categoryId = input.categoryId;
  if (input.name !== product.name) out.name = input.name;
  if (input.description !== product.description) out.description = input.description;
  if (input.price !== product.price) out.price = input.price;
  if (input.imageUrl !== product.imageUrl) out.imageUrl = input.imageUrl;
  if (input.isAvailable !== product.isAvailable) out.isAvailable = input.isAvailable;
  if (input.isBestSeller !== product.isBestSeller) out.isBestSeller = input.isBestSeller;
  if (Number.isNaN(input.price)) out.price = input.price;
  const before = JSON.stringify(product.options.map((o) => [o.id, o.name, o.extraPrice]));
  const after = JSON.stringify(input.options.map((o) => [o.id, o.name, o.extraPrice]));
  if (before !== after) out.options = input.options;
  const bundleBefore = JSON.stringify(product.bundleItems.map((b) => [b.productId, b.optionId, b.quantity]));
  const bundleAfter = JSON.stringify(input.bundleItems.map((b) => [b.productId, b.optionId, b.quantity]));
  if (bundleBefore !== bundleAfter) out.bundleItems = input.bundleItems;
  return out;
}

/** `product` null = tambah menu baru. */
export function ProductFormDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const categories = useCategories();
  const [form, setForm] = useState(() => initialState(product, ""));
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const mutation = product ? update : create;
  const errors = mutation.error instanceof AppError ? mutation.error.fieldErrors : {};
  // Pesan error lama hilang begitu admin mulai memperbaiki isian.
  const clearError = () => {
    if (mutation.error) mutation.reset();
  };
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    clearError();
    setForm((f) => ({ ...f, [key]: value }));
  };
  const setOption = (key: string, patch: Partial<OptionRow>) => {
    clearError();
    setForm((f) => ({ ...f, options: f.options.map((o) => (o.key === key ? { ...o, ...patch } : o)) }));
  };
  const setBundle = (key: string, patch: Partial<BundleRow>) => {
    clearError();
    setForm((f) => ({ ...f, bundle: f.bundle.map((b) => (b.key === key ? { ...b, ...patch } : b)) }));
  };
  // Pilihan isi paket: menu pusat selain dirinya sendiri & selain paket lain.
  const catalog = useProducts({ query: "", categoryId: "", availability: "all", storeId: "" });
  const candidates = (catalog.data ?? []).filter((p) => p.id !== product?.id && p.bundleItems.length === 0);
  const byId = new Map(candidates.map((p) => [p.id, p]));
  const separatePrice = form.bundle.reduce((sum, b) => {
    const p = byId.get(b.productId);
    const extra = p?.options.find((o) => o.id === b.optionId)?.extraPrice ?? 0;
    return sum + (p ? (p.price + extra) * Number(b.quantity || 0) : 0);
  }, 0);

  const input = toInput(form);
  const diff = product ? changes(product, input) : null;
  const unchanged = diff !== null && Object.keys(diff).length === 0;
  const [imageFailed, setImageFailed] = useState<string | null>(null);
  const showImage = form.imageUrl.startsWith("https://") && imageFailed !== form.imageUrl;

  const submit = () => {
    if (product && diff) update.mutate({ id: product.id, ...diff }, { onSuccess: onClose });
    else create.mutate(input, { onSuccess: onClose });
  };

  const dealNote =
    product?.dealPrice != null && input.price <= product.dealPrice
      ? `Promo aktif ${formatRupiah(product.dealPrice)} tidak lagi lebih murah, jadi pelanggan membayar harga ini.`
      : product?.dealPrice != null
        ? `Sedang promo: pelanggan membayar ${formatRupiah(product.dealPrice)}.`
        : "Harga sebelum varian & promo.";

  return (
    <Dialog
      open
      onClose={onClose}
      title={product ? `Ubah ${product.name}` : "Tambah menu"}
      description={
        product
          ? `${product.categoryName} · ${product.id}`
          : "Menu baru langsung tampil di aplikasi begitu disimpan (bila stoknya tersedia)."
      }
      className="w-[min(46rem,calc(100vw-2rem))]"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} isLoading={mutation.isPending} disabled={unchanged}>
            {product ? "Simpan perubahan" : "Tambah menu"}
          </Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="flex flex-col gap-4">
          <Field label="Nama menu" error={errors.name}>
            <Input value={form.name} maxLength={100} onChange={(e) => set("name", e.target.value)} placeholder="Es Teh Manis" autoFocus={!product} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori" error={errors.categoryId}>
              <Select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">Pilih kategori…</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Harga (Rp)" error={errors.price} hint={dealNote}>
              <Input inputMode="numeric" className="tabular" value={form.price} onChange={(e) => set("price", digits(e.target.value))} placeholder="8000" />
            </Field>
          </div>
          <Field label="Deskripsi" error={errors.description} hint={`${form.description.length}/500`}>
            <Textarea
              value={form.description}
              maxLength={500}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Teh melati diseduh segar, manisnya pas."
            />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[0.8125rem] font-semibold">Varian</legend>
            <p className="-mt-1 mb-1 text-[0.8125rem] text-ink-muted">
              Opsional, mis. ukuran atau level pedas. Varian pertama jadi pilihan awal di aplikasi.
            </p>
            {form.options.map((o, i) => (
              <div key={o.key} className="flex items-start gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <Input
                    aria-label={`Nama varian ${i + 1}`}
                    value={o.name}
                    maxLength={50}
                    invalid={Boolean(errors[`options.${i}.name`])}
                    onChange={(e) => setOption(o.key, { name: e.target.value })}
                    placeholder={i === 0 ? "Regular" : "Large"}
                  />
                  {errors[`options.${i}.name`] && <span className="text-xs text-danger">{errors[`options.${i}.name`]}</span>}
                </div>
                <div className="flex w-36 flex-col gap-1">
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-faint">+Rp</span>
                    <Input
                      aria-label={`Tambahan harga varian ${i + 1}`}
                      inputMode="numeric"
                      className="tabular pl-11"
                      value={o.extraPrice}
                      invalid={Boolean(errors[`options.${i}.extraPrice`])}
                      onChange={(e) => setOption(o.key, { extraPrice: digits(e.target.value) })}
                    />
                  </div>
                  {errors[`options.${i}.extraPrice`] && <span className="text-xs text-danger">{errors[`options.${i}.extraPrice`]}</span>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus varian ${o.name || i + 1}`}
                  onClick={() => set("options", form.options.filter((x) => x.key !== o.key))}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {errors.options && <span className="text-xs text-danger">{errors.options}</span>}
            {form.options.length < MAX_OPTIONS && (
              <Button variant="outline" size="sm" className="w-fit" onClick={() => set("options", [...form.options, newRow()])}>
                <Plus aria-hidden /> Tambah varian
              </Button>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-[0.8125rem] font-semibold">Isi paket (combo)</legend>
            <p className="-mt-1 mb-1 text-[0.8125rem] text-ink-muted">
              Opsional. Diisi = menu ini jadi paket: tampil dengan isi & &quot;hemat&quot; di aplikasi, ikut habis bila salah satu
              isinya habis, dan stok isinya ikut berkurang saat dipesan.
            </p>
            {form.bundle.map((b, i) => {
              const chosen = byId.get(b.productId);
              return (
                <div key={b.key} className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <Select
                      aria-label={`Menu isi ${i + 1}`}
                      value={b.productId}
                      invalid={Boolean(errors[`bundleItems.${i}.productId`])}
                      onChange={(e) => setBundle(b.key, { productId: e.target.value, optionId: "" })}
                    >
                      <option value="">Pilih menu…</option>
                      {candidates.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {formatRupiah(p.price)}
                        </option>
                      ))}
                    </Select>
                    {errors[`bundleItems.${i}.productId`] && (
                      <span className="text-xs text-danger">{errors[`bundleItems.${i}.productId`]}</span>
                    )}
                  </div>
                  <Select
                    aria-label={`Varian isi ${i + 1}`}
                    className="w-36"
                    value={b.optionId}
                    disabled={!chosen || chosen.options.length === 0}
                    invalid={Boolean(errors[`bundleItems.${i}.optionId`])}
                    onChange={(e) => setBundle(b.key, { optionId: e.target.value })}
                  >
                    <option value="">{chosen && chosen.options.length > 0 ? "Varian awal" : "—"}</option>
                    {chosen?.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                        {o.extraPrice > 0 ? ` (+${formatRupiah(o.extraPrice)})` : ""}
                      </option>
                    ))}
                  </Select>
                  <div className="flex w-20 flex-col gap-1">
                    <Input
                      aria-label={`Jumlah isi ${i + 1}`}
                      inputMode="numeric"
                      className="tabular"
                      value={b.quantity}
                      invalid={Boolean(errors[`bundleItems.${i}.quantity`])}
                      onChange={(e) => setBundle(b.key, { quantity: digits(e.target.value) })}
                    />
                    {errors[`bundleItems.${i}.quantity`] && <span className="text-xs text-danger">{errors[`bundleItems.${i}.quantity`]}</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus isi ${chosen?.name ?? i + 1}`}
                    onClick={() => set("bundle", form.bundle.filter((x) => x.key !== b.key))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
            {errors.bundleItems && <span className="text-xs text-danger">{errors.bundleItems}</span>}
            {form.bundle.length > 0 && separatePrice > 0 && (
              <p className="tabular text-[0.8125rem] text-ink-muted">
                Beli satuan {formatRupiah(separatePrice)}
                {input.price > 0 && input.price < separatePrice
                  ? ` · pelanggan hemat ${formatRupiah(separatePrice - input.price)}`
                  : input.price >= separatePrice
                    ? " · harga paket belum lebih murah dari beli satuan"
                    : ""}
              </p>
            )}
            {form.bundle.length < MAX_BUNDLE_ITEMS && (
              <Button variant="outline" size="sm" className="w-fit" onClick={() => set("bundle", [...form.bundle, newBundleRow()])}>
                <Plus aria-hidden /> Tambah isi paket
              </Button>
            )}
          </fieldset>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-image">Foto</Label>
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-panel border border-line bg-surface-muted">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="Pratinjau foto menu" className="size-full object-cover" onError={() => setImageFailed(form.imageUrl)} />
              ) : (
                <span className="flex flex-col items-center gap-1 px-4 text-center text-xs text-ink-faint">
                  <ImageOff className="size-5" aria-hidden />
                  {imageFailed === form.imageUrl && form.imageUrl ? "Foto tidak bisa dimuat" : "Belum ada foto"}
                </span>
              )}
            </div>
            <Input
              id="product-image"
              type="url"
              size="sm"
              value={form.imageUrl}
              invalid={Boolean(errors.imageUrl)}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://images.unsplash.com/…"
            />
            <p className={errors.imageUrl ? "text-xs text-danger" : "text-xs text-ink-muted"}>
              {errors.imageUrl ?? "Tempel URL foto (https). Kosong = tanpa foto."}
            </p>
          </div>
          <Switch label="Stok tersedia" checked={form.isAvailable} onChange={(e) => set("isAvailable", e.target.checked)} />
          <Switch label="Label Terlaris" checked={form.isBestSeller} onChange={(e) => set("isBestSeller", e.target.checked)} />
        </div>
      </div>
      {mutation.error instanceof AppError && Object.keys(errors).length === 0 && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {mutation.error.message}
        </p>
      )}
    </Dialog>
  );
}
