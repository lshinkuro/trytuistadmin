const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 15000 → "Rp 15.000" */
export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value).replace(/ /g, " ");
}

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 12.5 → "+12,5%", null → "–" */
export function formatChange(pct: number | null): string {
  if (pct === null) return "–";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
}

const TIME_ZONE = "Asia/Jakarta";

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: TIME_ZONE }).format(date);
}

/** "2026-10-18" → "18 Okt" */
export function formatShortDay(isoDay: string): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)),
  );
}

/** Tanggal hari ini (WIB) sebagai "YYYY-MM-DD". */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** "YYYY-MM-DD" ± n hari. */
export function shiftISODay(isoDay: string, days: number): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

/** Date → nilai <input type="datetime-local"> di WIB. */
export function toDateTimeLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Nilai <input type="datetime-local"> (dianggap WIB) → Date. */
export function fromDateTimeLocal(value: string): Date {
  return new Date(`${value}:00+07:00`);
}
