"use client";

import type { DateRange } from "@/domain/shared/dateRange";
import { cn } from "@/shared/lib/cn";
import { shiftISODay, todayISO } from "@/shared/lib/format";
import { Input } from "../../components/ui";

export function presetRanges(today = todayISO()): { key: string; label: string; range: DateRange }[] {
  return [
    { key: "today", label: "Hari ini", range: { from: today, to: today } },
    { key: "7d", label: "7 hari", range: { from: shiftISODay(today, -6), to: today } },
    { key: "30d", label: "30 hari", range: { from: shiftISODay(today, -29), to: today } },
    { key: "month", label: "Bulan ini", range: { from: `${today.slice(0, 8)}01`, to: today } },
  ];
}

export function DateRangeControl({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  const presets = presetRanges();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Rentang cepat" className="flex rounded-control border border-line-strong bg-surface p-0.5">
        {presets.map((p) => {
          const active = p.range.from === value.from && p.range.to === value.to;
          return (
            <button
              key={p.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(p.range)}
              className={cn(
                "h-8 rounded-[4px] px-3 text-[0.8125rem] font-semibold transition-colors",
                active ? "bg-ink text-surface" : "text-ink-muted hover:text-ink",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          size="sm"
          aria-label="Dari tanggal"
          value={value.from}
          max={value.to}
          onChange={(e) => e.target.value && onChange({ ...value, from: e.target.value })}
          className="w-36"
        />
        <span className="text-ink-faint" aria-hidden>
          –
        </span>
        <Input
          type="date"
          size="sm"
          aria-label="Sampai tanggal"
          value={value.to}
          min={value.from}
          onChange={(e) => e.target.value && onChange({ ...value, to: e.target.value })}
          className="w-36"
        />
      </div>
    </div>
  );
}
