"use client";

import {
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  TicketPercent,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ACTIVE_STATUSES } from "@/domain/order/orderStatus";
import { cn } from "@/shared/lib/cn";
import { useCurrentAdmin, useLogout } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Pesanan", icon: ReceiptText, showActiveCount: true },
  { href: "/products", label: "Produk & harga", icon: UtensilsCrossed },
  { href: "/promos", label: "Promo", icon: TicketPercent },
  { href: "/customers", label: "Pelanggan", icon: Users },
  { href: "/activity", label: "Aktivitas", icon: History },
] as const;

/** Jumlah pesanan yang masih perlu ditangani (badge di menu Pesanan). */
function useActiveOrderCount() {
  const { data } = useOrders({ statuses: ACTIVE_STATUSES, query: "", range: null, page: 1, limit: 1 });
  return data?.total ?? 0;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeCount = useActiveOrderCount();
  return (
    <nav aria-label="Menu utama" className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors",
              active ? "bg-brand-soft text-brand" : "text-ink-muted hover:bg-neutral-soft hover:text-ink",
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {"showActiveCount" in item && activeCount > 0 && (
              <span className="tabular rounded-full bg-warning-soft px-2 text-xs font-bold text-warning" aria-label={`${activeCount} pesanan aktif`}>
                {activeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountBlock() {
  const { data: admin } = useCurrentAdmin();
  const logout = useLogout();
  return (
    <div className="flex items-center gap-2 border-t border-line pt-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-soft text-sm font-bold text-ink" aria-hidden>
        {admin?.name.slice(0, 1).toUpperCase() ?? "·"}
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{admin?.name ?? "Memuat…"}</span>
        <span className="truncate text-xs text-ink-muted">{admin?.email ?? ""}</span>
      </span>
      <ThemeToggle />
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="inline-flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-danger-soft hover:text-danger"
        aria-label="Keluar"
        title="Keluar"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  // Drawer ditutup lewat onNavigate saat link diklik.
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:gap-6 lg:p-4">
        <BrandMark className="px-1 pt-1" />
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <AccountBlock />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <BrandMark />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex size-10 items-center justify-center rounded-control hover:bg-neutral-soft"
          aria-label="Buka menu"
          aria-expanded={open}
        >
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Tutup menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-6 bg-surface p-4">
            <div className="flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-control hover:bg-neutral-soft"
                aria-label="Tutup menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <AccountBlock />
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
