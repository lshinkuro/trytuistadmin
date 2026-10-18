"use client";

import { useState } from "react";
import type { Product } from "@/domain/product/Product";
import { AppError } from "@/domain/shared/errors";
import { formatRupiah } from "@/shared/lib/format";
import { Button, Dialog, Field, Input, Switch, Textarea } from "../../components/ui";
import { useUpdateProduct } from "../../hooks/useProducts";

export function EditProductDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description);
  const [isBestSeller, setIsBestSeller] = useState(product.isBestSeller);
  const update = useUpdateProduct();
  const errors = update.error instanceof AppError ? update.error.fieldErrors : {};

  const priceNumber = Number(price.replace(/\D/g, ""));
  const dealIgnored = product.dealPrice !== null && price !== "" && priceNumber <= product.dealPrice;

  const save = () =>
    update.mutate(
      {
        id: product.id,
        ...(name !== product.name ? { name } : {}),
        ...(priceNumber !== product.price ? { price: priceNumber } : {}),
        ...(description !== product.description ? { description } : {}),
        ...(isBestSeller !== product.isBestSeller ? { isBestSeller } : {}),
      },
      { onSuccess: onClose },
    );

  const unchanged =
    name === product.name && priceNumber === product.price && description === product.description && isBestSeller === product.isBestSeller;

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Ubah ${product.name}`}
      description={`${product.categoryName} · ${product.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={save} isLoading={update.isPending} disabled={unchanged || price === ""}>
            Simpan perubahan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nama produk" error={errors.productName ?? errors.name}>
          <Input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field
          label="Harga normal (Rp)"
          error={errors.price}
          hint={
            dealIgnored
              ? `Promo aktif ${formatRupiah(product.dealPrice ?? 0)} tidak lagi lebih murah, jadi pelanggan membayar harga ini.`
              : product.dealPrice !== null
                ? `Sedang promo: pelanggan membayar ${formatRupiah(product.dealPrice)}.`
                : "Harga yang dibayar pelanggan, sebelum varian & promo."
          }
        >
          <Input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} className="tabular" />
        </Field>
        <Field label="Deskripsi" error={errors.description}>
          <Textarea value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Switch label="Tampilkan label Terlaris" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
        {update.error instanceof AppError && Object.keys(errors).length === 0 && (
          <p role="alert" className="text-sm text-danger">
            {update.error.message}
          </p>
        )}
      </div>
    </Dialog>
  );
}
