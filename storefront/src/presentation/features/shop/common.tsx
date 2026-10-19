"use client";

import { Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import { comboLabel, type Product } from "@/domain/catalog/Catalog";
import { cn } from "@/shared/lib/cn";
import { formatRupiah } from "@/shared/lib/format";

export function Price({ price, original, className }: { price: number; original?: number | null; className?: string }) {
  return (
    <span className={cn("tabular inline-flex items-baseline gap-1.5", className)}>
      <span className="font-bold text-ink">{formatRupiah(price)}</span>
      {original != null && original > price && <span className="text-xs text-ink-faint line-through">{formatRupiah(original)}</span>}
    </span>
  );
}

export function ProductBadge({ product }: { product: Product }) {
  if (product.originalPrice) {
    return <span className="rounded-full bg-danger px-1.5 py-0.5 text-[0.625rem] font-extrabold text-white">-{product.discountPercent}%</span>;
  }
  if (product.combo) return <span className="rounded-full bg-brand px-1.5 py-0.5 text-[0.625rem] font-extrabold text-brand-ink">PAKET</span>;
  if (product.isBestSeller) return <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-[0.625rem] font-bold text-warning">Terlaris</span>;
  return null;
}

/** Kartu menu (grid). */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/menu/${product.id}`}
      className={cn("flex flex-col overflow-hidden rounded-panel border border-line bg-surface transition-shadow hover:shadow-md", !product.isAvailable && "opacity-60")}
    >
      <div className="relative aspect-[4/3] bg-surface-muted">
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
        )}
        <span className="absolute top-2 left-2">
          <ProductBadge product={product} />
        </span>
        {!product.isAvailable && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white">Habis</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-1 text-sm font-semibold">{product.name}</span>
        <span className="line-clamp-2 text-xs text-ink-muted">{product.combo ? comboLabel(product.combo) : product.description}</span>
        <span className="flex items-center gap-1 text-xs text-ink-muted">
          <Star className="size-3 fill-warning text-warning" aria-hidden /> {product.rating.toFixed(1)} · {product.soldCount} terjual
        </span>
        <Price price={product.price} original={product.originalPrice} className="mt-auto pt-1 text-sm" />
      </div>
    </Link>
  );
}

export function QuantityStepper({
  value,
  min = 0,
  max,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-line-strong" role="group" aria-label={label}>
      <button type="button" className="flex size-8 items-center justify-center text-ink-muted disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Kurangi">
        <Minus className="size-4" />
      </button>
      <span className="tabular w-7 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button type="button" className="flex size-8 items-center justify-center text-brand disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Tambah">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function SectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-semibold text-brand">
          Lihat semua
        </Link>
      )}
    </div>
  );
}

export function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-3 text-sm", strong ? "text-base font-extrabold" : "text-ink-muted")}>
      <span>{label}</span>
      <span className={cn("tabular", !strong && "text-ink")}>{value}</span>
    </div>
  );
}
