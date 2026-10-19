"use client";

import { useState } from "react";
import type { Product, StoreProduct } from "@/domain/product/Product";
import { AppError } from "@/domain/shared/errors";
import { formatRupiah } from "@/shared/lib/format";
import { Button, Dialog, Field, Input, Switch } from "../../components/ui";
import { useSetStoreProduct } from "../../hooks/useStores";

const digits = (v: string) => v.replace(/\D/g, "");

/** Menu di satu outlet: dijual atau tidak, habis, stok, dan harga khusus outlet (§5.29). */
export function StoreProductDialog({
  product,
  store,
  storeName,
  onClose,
}: {
  product: Product;
  store: StoreProduct;
  storeName: string;
  onClose: () => void;
}) {
  const [isListed, setIsListed] = useState(store.isListed);
  const [isSoldOut, setIsSoldOut] = useState(store.isSoldOut);
  const [trackStock, setTrackStock] = useState(store.stock !== null);
  const [stock, setStock] = useState(store.stock === null ? "" : String(store.stock));
  const [price, setPrice] = useState(store.price === null ? "" : String(store.price));
  const save = useSetStoreProduct();
  const errors = save.error instanceof AppError ? save.error.fieldErrors : {};

  const submit = () =>
    save.mutate(
      {
        storeId: store.storeId,
        productId: product.id,
        input: {
          isListed,
          isSoldOut,
          stock: trackStock ? Number(stock || 0) : null,
          price: price === "" ? null : Number(price),
        },
      },
      { onSuccess: onClose },
    );

  return (
    <Dialog
      open
      onClose={onClose}
      title={`${product.name} di ${storeName}`}
      description={`Harga pusat ${formatRupiah(product.price)} · ${product.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} isLoading={save.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Switch label="Dijual di outlet ini" checked={isListed} onChange={(e) => setIsListed(e.target.checked)} />
        {isListed ? (
          <>
            <Switch
              label="Tandai habis (sementara)"
              checked={isSoldOut}
              onChange={(e) => setIsSoldOut(e.target.checked)}
            />
            <Switch
              label="Hitung stok"
              checked={trackStock}
              onChange={(e) => setTrackStock(e.target.checked)}
            />
            {trackStock && (
              <Field
                label="Sisa stok"
                error={errors.stock}
                hint="Berkurang otomatis saat pesanan dibuat dan kembali bila pesanan batal/gagal. 0 = habis."
              >
                <Input inputMode="numeric" value={stock} onChange={(e) => setStock(digits(e.target.value))} className="tabular" />
              </Field>
            )}
            <Field
              label="Harga khusus outlet (Rp)"
              error={errors.price}
              hint={`Kosongkan untuk memakai harga pusat ${formatRupiah(product.price)}. Promo tetap berlaku bila lebih murah.`}
            >
              <Input
                inputMode="numeric"
                value={price}
                placeholder={String(product.price)}
                onChange={(e) => setPrice(digits(e.target.value))}
                className="tabular"
              />
            </Field>
          </>
        ) : (
          <p className="text-sm text-ink-muted">Menu ini tidak tampil di aplikasi untuk pelanggan yang memesan dari {storeName}.</p>
        )}
        {save.error instanceof AppError && Object.keys(errors).length === 0 && (
          <p role="alert" className="text-sm text-danger">
            {save.error.message}
          </p>
        )}
      </div>
    </Dialog>
  );
}
