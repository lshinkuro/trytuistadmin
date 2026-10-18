/** Rentang tanggal inklusif dalam format "YYYY-MM-DD" (zona waktu toko, WIB). */
export interface DateRange {
  from: string;
  to: string;
}

export const MAX_RANGE_DAYS = 366;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export function daysInRange(range: DateRange): number {
  const from = Date.parse(`${range.from}T00:00:00Z`);
  const to = Date.parse(`${range.to}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000) + 1;
}

/** Pesan error, atau null bila rentang valid. Aturan sama dengan backend. */
export function validateDateRange(range: DateRange): string | null {
  if (!ISO_DAY.test(range.from) || !ISO_DAY.test(range.to)) return "Format tanggal harus YYYY-MM-DD.";
  const days = daysInRange(range);
  if (days < 1) return "Tanggal mulai tidak boleh setelah tanggal akhir.";
  if (days > MAX_RANGE_DAYS) return "Rentang maksimal 366 hari.";
  return null;
}
