"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { makeItem } from "@/domain/cart/Cart";
import type { Product } from "@/domain/catalog/Catalog";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";
import { ErrorState } from "../../components/common/States";
import { Button, Skeleton, Textarea } from "../../components/ui";
import { useOutlet, useProduct } from "../../hooks/useShopData";
import { useShop } from "../../providers/ShopProvider";
import { Price, ProductBadge, QuantityStepper } from "../shop/common";

export function ProductView({ id }: { id: string }) {
  const { storeId } = useOutlet();
  const product = useProduct(id, storeId);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={() => router.back()} className="flex w-fit items-center gap-1 text-sm font-semibold text-ink-muted">
        <ArrowLeft className="size-4" aria-hidden /> Kembali
      </button>
      {product.isPending && <Skeleton className="h-96 w-full" />}
      {product.isError && <ErrorState error={product.error} onRetry={() => product.refetch()} />}
      {product.data && <ProductDetail product={product.data} />}
    </div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const { add, rules } = useShop();
  const router = useRouter();
  const [optionId, setOptionId] = useState(product.options[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const option = product.options.find((o) => o.id === optionId) ?? null;
  const unit = product.price + (option?.extraPrice ?? 0);

  const addToCart = (goToCart: boolean) => {
    add(makeItem(product, option, quantity, note));
    router.push(goToCart ? "/keranjang" : "/menu");
  };

  return (
    <div className="flex flex-col gap-5 pb-20">
      {product.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt="" className="aspect-[4/3] w-full rounded-panel object-cover" />
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-extrabold">{product.name}</h1>
          <ProductBadge product={product} />
        </div>
        <p className="text-sm text-ink-muted">{product.description}</p>
        <Price price={unit} original={product.originalPrice ? product.originalPrice + (option?.extraPrice ?? 0) : null} className="text-lg" />
      </div>

      {product.combo && (
        <div className="flex flex-col gap-1.5 rounded-panel bg-brand-soft p-3 text-sm">
          <span className="font-semibold">Isi paket</span>
          {product.combo.items.map((i) => (
            <span key={`${i.name}-${i.optionName}`} className="flex items-center gap-1.5">
              <Check className="size-4 text-brand" aria-hidden /> {i.quantity}× {i.name}
              {i.optionName && ` (${i.optionName})`}
            </span>
          ))}
          {product.combo.savings > 0 && (
            <span className="font-semibold text-brand">
              Hemat {formatRupiah(product.combo.savings)} dibanding beli satuan ({formatRupiah(product.combo.separatePrice)})
            </span>
          )}
        </div>
      )}

      {product.options.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">Pilih varian</legend>
          {product.options.map((o) => (
            <label
              key={o.id}
              className={cn("flex cursor-pointer items-center justify-between rounded-panel border p-3 text-sm", o.id === optionId ? "border-brand bg-brand-soft" : "border-line")}
            >
              <span className="flex items-center gap-2">
                <input type="radio" name="option" checked={o.id === optionId} onChange={() => setOptionId(o.id)} className="accent-[var(--brand)]" />
                {o.name}
              </span>
              <span className="tabular text-ink-muted">{o.extraPrice > 0 ? `+${formatRupiah(o.extraPrice)}` : "Gratis"}</span>
            </label>
          ))}
        </fieldset>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">Catatan (opsional)</span>
        <Textarea value={note} maxLength={rules.maxNoteLength} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: less sugar, tanpa es" />
        <span className="text-xs text-ink-faint">
          {note.length}/{rules.maxNoteLength}
        </span>
      </label>

      <div className="fixed inset-x-0 bottom-14 z-10 mx-auto flex max-w-xl items-center gap-3 border-t border-line bg-surface px-4 py-3">
        {product.isAvailable ? (
          <>
            <QuantityStepper value={quantity} min={rules.minQuantity} max={rules.maxQuantity} onChange={setQuantity} label="Jumlah" />
            <Button variant="outline" className="flex-1" onClick={() => addToCart(false)}>
              + Keranjang
            </Button>
            <Button className="flex-1" onClick={() => addToCart(true)}>
              Pesan · {formatRupiah(unit * quantity)}
            </Button>
          </>
        ) : (
          <p className="w-full text-center text-sm font-semibold text-danger">Menu ini sedang habis di outlet ini.</p>
        )}
      </div>
    </div>
  );
}
