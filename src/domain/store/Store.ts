/** Outlet (§5.26, §5.29). Tiap outlet punya daftar menu, stok, harga khusus, promo, jam buka, dan jangkauan antar. */
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
  /** Menu yang dijual tapi habis (saklar atau stok 0). */
  unavailableProducts: number;
  /** Menu yang dijual di outlet ini. */
  listedProducts: number;
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
  /** Keadaan satu menu di satu outlet (diganti seluruhnya). */
  setStoreProduct(storeId: string, productId: string, input: StoreProductInput): Promise<void>;
}

export interface StoreProductInput {
  isListed: boolean;
  isSoldOut: boolean;
  /** null = stok tidak dihitung. */
  stock: number | null;
  /** null = harga pusat. */
  price: number | null;
}

export const MAX_STOCK = 1_000_000;

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isClock(v: string): boolean {
  return CLOCK.test(v);
}

export const MAX_RADIUS_KM = 50;
