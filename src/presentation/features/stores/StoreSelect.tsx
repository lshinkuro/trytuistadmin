"use client";

import { Select } from "../../components/ui";
import { useStores } from "../../hooks/useStores";

/**
 * Pemilih outlet untuk filter (Dashboard, Pesanan, Produk). `""` = semua outlet.
 * `allLabel` diganti sesuai konteks, mis. "Stok pusat (semua outlet)".
 */
export function StoreSelect({
  value,
  onChange,
  allLabel = "Semua outlet",
  className,
}: {
  value: string;
  onChange: (storeId: string) => void;
  allLabel?: string;
  className?: string;
}) {
  const stores = useStores();
  return (
    <Select aria-label="Outlet" value={value} onChange={(e) => onChange(e.target.value)} className={className ?? "w-52"}>
      <option value="">{allLabel}</option>
      {stores.data?.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
          {s.isActive ? "" : " (nonaktif)"}
        </option>
      ))}
    </Select>
  );
}
