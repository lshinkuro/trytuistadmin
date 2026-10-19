// Aturan ongkir per jarak & estimasi waktu antar (app_config.order_rules, API_PLAN §7).
// Perhitungan contoh SELALU dari backend (fungsi yang sama dengan checkout), tidak dihitung ulang di web.

export interface DeliverySettings {
  /** Tarif dasar (Rp) sampai `deliveryBaseKm`. */
  deliveryFee: number;
  deliveryBaseKm: number;
  /** Rp per km berikutnya (dibulatkan ke atas). 0 = ongkir flat. */
  deliveryFeePerKm: number;
  /** 0 = tanpa batas atas. */
  deliveryFeeMax: number;
  /** Gratis ongkir bila subtotal ≥ nilai ini. 0 = nonaktif. */
  freeDeliveryMinSubtotal: number;
  prepMinutes: number;
  courierSpeedKmh: number;
  /** Kupon gratis ongkir mingguan per pelanggan (diaktifkan pelanggan saat checkout). */
  freeDeliveryCouponEnabled: boolean;
  /** Jumlah kupon per minggu (reset Senin 00:00 WIB). */
  freeDeliveryCouponWeekly: number;
}

export interface DeliveryExample {
  distanceKm: number;
  fee: number;
  etaMinMinutes: number;
  etaMaxMinutes: number;
}

export interface DeliveryOverview {
  settings: DeliverySettings;
  examples: DeliveryExample[];
  updatedAt: Date | null;
}

export interface DeliveryPreviewInput {
  settings: DeliverySettings;
  /** Subtotal keranjang contoh (cek gratis ongkir); 0 = abaikan. */
  subtotal: number;
  /** Kosong = jarak contoh standar dari server. */
  distances: number[];
}

export interface DeliveryRepository {
  get(): Promise<DeliveryOverview>;
  preview(input: DeliveryPreviewInput): Promise<DeliveryOverview>;
  save(settings: DeliverySettings): Promise<DeliveryOverview>;
}

type Field = keyof DeliverySettings;
type NumberField = Exclude<Field, "freeDeliveryCouponEnabled">;

/** Batas sama dengan validasi backend; pesan per field. Kosong = valid. */
export function validateDeliverySettings(s: DeliverySettings): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  const intIn = (field: NumberField, min: number, max: number) => {
    const v = s[field];
    if (!Number.isInteger(v) || v < min || v > max) errors[field] = `Isi angka bulat ${min.toLocaleString("id-ID")}–${max.toLocaleString("id-ID")}`;
  };
  intIn("deliveryFee", 0, 1_000_000);
  intIn("deliveryFeePerKm", 0, 100_000);
  intIn("deliveryFeeMax", 0, 1_000_000);
  intIn("freeDeliveryMinSubtotal", 0, 100_000_000);
  intIn("prepMinutes", 0, 240);
  intIn("freeDeliveryCouponWeekly", 1, 14);
  if (!Number.isFinite(s.deliveryBaseKm) || s.deliveryBaseKm < 0 || s.deliveryBaseKm > 50) errors.deliveryBaseKm = "Isi 0–50 km";
  if (!Number.isFinite(s.courierSpeedKmh) || s.courierSpeedKmh <= 0 || s.courierSpeedKmh > 120) {
    errors.courierSpeedKmh = "Isi lebih dari 0 sampai 120 km/jam";
  }
  if (!errors.deliveryFeeMax && !errors.deliveryFee && s.deliveryFeeMax > 0 && s.deliveryFeeMax < s.deliveryFee) {
    errors.deliveryFeeMax = "Harus ≥ tarif dasar, atau 0 untuk tanpa batas";
  }
  return errors;
}
