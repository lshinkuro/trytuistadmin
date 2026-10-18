"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyPoint } from "@/domain/dashboard/Dashboard";
import { cn } from "@/shared/lib/cn";
import { formatShortDay } from "@/shared/lib/format";

/** 1.500.000 → "1,5 jt", 250.000 → "250 rb" (label sumbu Y). */
export function compactRupiah(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(value);
}

interface Props {
  data: DailyPoint[];
  metric: "revenue" | "orders";
  /** Kelas warna teks Tailwind; bar memakai currentColor. */
  colorClass: string;
  formatValue: (value: number) => string;
  label: string;
}

/** Satu series per grafik (tanpa sumbu Y ganda): penjualan dan pembelian digambar terpisah. */
export function DailyBarChart({ data, metric, colorClass, formatValue, label }: Props) {
  return (
    <div className={cn("tt-chart h-48 w-full", colorClass)} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatShortDay}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            allowDecimals={false}
            tickFormatter={(v: number) => (metric === "revenue" ? compactRupiah(v) : String(v))}
          />
          <Tooltip
            cursor={{ radius: 4 }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as DailyPoint | undefined;
              if (!active || !point) return null;
              return (
                <div className="rounded-control border border-line bg-surface px-3 py-2 text-xs shadow-lg">
                  <p className="font-semibold text-ink">{formatShortDay(point.date)}</p>
                  <p className="tabular text-ink-muted">
                    {formatValue(point[metric])}
                    {metric === "orders" && ` · ${point.ordersCompleted} sukses`}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey={metric} fill="currentColor" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
