"use client";

import { ClipboardList, House, MapPin, ShoppingBag, User, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { useOrderRules, useOutlet } from "../../hooks/useShopData";
import { useShop } from "../../providers/ShopProvider";
import { Dialog } from "../ui";

const NAV = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
  { href: "/akun", label: "Akun", icon: User },
];

export function ShopShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { cartCount } = useShop();
  const outlet = useOutlet();
  useOrderRules();
  const [picking, setPicking] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col bg-canvas">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-brand">
          TryTuist
        </Link>
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-left text-sm"
          aria-label="Pilih outlet"
        >
          <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
          <span className="truncate font-semibold">{outlet.selected?.name ?? "Pilih outlet"}</span>
          {outlet.selected && !outlet.selected.isOpen && <span className="shrink-0 text-xs text-danger">Tutup</span>}
        </button>
        <Link href="/keranjang" className="relative p-1" aria-label={`Keranjang, ${cartCount} item`}>
          <ShoppingBag className="size-6" />
          {cartCount > 0 && (
            <span className="tabular absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[0.6875rem] font-bold text-brand-ink">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24">{children}</main>

      <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-xl border-t border-line bg-surface/95 backdrop-blur">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.6875rem] font-semibold", active ? "text-brand" : "text-ink-muted")}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <Dialog open={picking} onClose={() => setPicking(false)} title="Pilih outlet" description="Menu, harga, dan stok mengikuti outlet.">
        <ul className="flex flex-col gap-2">
          {(outlet.stores.data ?? []).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  outlet.select(s.id);
                  setPicking(false);
                }}
                className={cn(
                  "flex w-full flex-col rounded-panel border p-3 text-left",
                  s.id === outlet.storeId ? "border-brand bg-brand-soft" : "border-line hover:bg-surface-muted",
                )}
              >
                <span className="flex items-center justify-between gap-2 font-semibold">
                  {s.name}
                  <span className={cn("text-xs font-semibold", s.isOpen ? "text-success" : "text-danger")}>{s.isOpen ? "Buka" : "Tutup"}</span>
                </span>
                <span className="text-xs text-ink-muted">{s.address}</span>
                <span className="text-xs text-ink-muted">{s.closedNote ?? s.hoursLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
