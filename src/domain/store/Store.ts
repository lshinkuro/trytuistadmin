/** Outlet (§5.26). Harga menu sama di semua outlet; yang berbeda stok, jam buka, dan jangkauan antar. */
export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  /** "08:00" */
  opensAt: string;
  closesAt: string;
  /** "08:00–22:00" | "24 jam" */
  hoursLabel: string;
  deliveryRadiusKm: number;
  isActive: boolean;
  /** Tombol "tutup sementara" dari admin. */
  isTemporarilyClosed: boolean;
  isOpenNow: boolean;
  sortOrder: number;
  unavailableProducts: number;
  today: { orders: number; revenue: number; active: number };
}

export type StoreStatus = "OPEN" | "OUTSIDE_HOURS" | "TEMP_CLOSED" | "INACTIVE";

export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  OPEN: "Buka",
  OUTSIDE_HOURS: "Di luar jam buka",
  TEMP_CLOSED: "Tutup sementara",
  INACTIVE: "Nonaktif",
};

export function storeStatus(s: Pick<Store, "isActive" | "isTemporarilyClosed" | "isOpenNow">): StoreStatus {
  if (!s.isActive) return "INACTIVE";
  if (s.isTemporarilyClosed) return "TEMP_CLOSED";
  return s.isOpenNow ? "OPEN" : "OUTSIDE_HOURS";
}

export interface StoreInput {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  opensAt: string;
  closesAt: string;
  deliveryRadiusKm: number;
  isActive: boolean;
  isTemporarilyClosed: boolean;
}

export interface StoreRepository {
  list(): Promise<Store[]>;
  create(input: StoreInput): Promise<Store>;
  update(id: string, input: Partial<StoreInput>): Promise<Store>;
  /** Habis / tersedia di satu outlet. */
  setProductAvailability(storeId: string, productId: string, isAvailable: boolean): Promise<void>;
}

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isClock(v: string): boolean {
  return CLOCK.test(v);
}

export const MAX_RADIUS_KM = 50;
