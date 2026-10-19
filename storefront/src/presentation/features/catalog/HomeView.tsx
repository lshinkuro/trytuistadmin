"use client";

import { Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Banner } from "@/domain/catalog/Catalog";
import { ErrorState } from "../../components/common/States";
import { Button, Dialog, Skeleton } from "../../components/ui";
import { useHomeData, useOutlet } from "../../hooks/useShopData";
import { ProductCard, SectionTitle } from "../shop/common";

export function HomeView() {
  const { storeId } = useOutlet();
  const { banners, categories, products } = useHomeData(storeId);
  const router = useRouter();
  const [couponInfo, setCouponInfo] = useState(false);
  const list = products.data ?? [];
  const available = list.filter((p) => p.isAvailable);
  const deals = available.filter((p) => p.originalPrice).sort((a, b) => b.discountPercent - a.discountPercent);
  const combos = available.filter((p) => p.combo);
  const best = available.filter((p) => p.isBestSeller);

  const tapBanner = (b: Banner) => {
    if (b.action.type === "PRODUCT") router.push(`/menu/${b.action.productId}`);
    else if (b.action.type === "CATEGORY") router.push(`/menu?kategori=${encodeURIComponent(b.action.categoryId)}`);
    else if (b.action.type === "FREE_DELIVERY") setCouponInfo(true);
  };

  if (products.isError) return <ErrorState error={products.error} onRetry={() => products.refetch()} />;

  return (
    <div className="flex flex-col gap-6">
      {(banners.data?.length ?? 0) > 0 && (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {banners.data!.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => tapBanner(b)}
              disabled={b.action.type === "NONE"}
              className="relative h-40 w-[85%] shrink-0 snap-center overflow-hidden rounded-panel text-left disabled:cursor-default"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
              <span className="absolute bottom-0 flex flex-col p-4 text-white">
                <span className="w-fit rounded-full bg-brand px-2 py-0.5 text-[0.625rem] font-extrabold tracking-wider text-brand-ink">PROMO</span>
                <span className="mt-1 text-lg font-bold">{b.title}</span>
                <span className="text-sm opacity-90">{b.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {(categories.data ?? []).map((c) => (
          <Link key={c.id} href={`/menu?kategori=${encodeURIComponent(c.id)}`} className="flex flex-col items-center gap-1 rounded-panel bg-surface p-2 text-center">
            <span className="text-2xl" aria-hidden>
              {c.icon}
            </span>
            <span className="line-clamp-1 text-[0.6875rem] font-semibold">{c.name}</span>
          </Link>
        ))}
      </div>

      {products.isPending && <Skeleton className="h-64 w-full" />}
      {[
        { title: "💸 Promo Hemat", items: deals },
        { title: "🍱 Paket Hemat", items: combos },
        { title: "🔥 Terlaris", items: best },
      ]
        .filter((s) => s.items.length > 0)
        .map((s) => (
          <section key={s.title} className="flex flex-col gap-3">
            <SectionTitle title={s.title} href="/menu" />
            <div className="grid grid-cols-2 gap-3">
              {s.items.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))}

      <Dialog
        open={couponInfo}
        onClose={() => setCouponInfo(false)}
        title="Kupon gratis ongkir mingguan"
        footer={
          <Button onClick={() => router.push("/keranjang")}>
            <Ticket aria-hidden /> Buka keranjang
          </Button>
        }
      >
        <p className="text-sm text-ink-muted">
          Setiap minggu kamu dapat kupon gratis ongkir. Nyalakan &quot;Pakai kupon gratis ongkir&quot; di keranjang saat checkout; sisa kupon terlihat di
          sana. Kuota baru setiap Senin.
        </p>
      </Dialog>
    </div>
  );
}
