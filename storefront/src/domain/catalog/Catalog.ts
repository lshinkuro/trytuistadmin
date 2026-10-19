export interface Store {
  id: string;
  name: string;
  address: string;
  isOpen: boolean;
  hoursLabel: string;
  distanceKm: number | null;
  isDeliverable: boolean | null;
  closedNote: string | null;
}

export type BannerAction =
  | { type: "NONE" }
  | { type: "PRODUCT"; productId: string }
  | { type: "CATEGORY"; categoryId: string }
  | { type: "FREE_DELIVERY" };

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  action: BannerAction;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface ProductOption {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Combo {
  items: { name: string; optionName: string | null; quantity: number }[];
  separatePrice: number;
  savings: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  /** Harga berlaku (sudah promo). */
  price: number;
  /** Harga normal bila sedang promo. */
  originalPrice: number | null;
  discountPercent: number;
  imageUrl: string;
  rating: number;
  soldCount: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  options: ProductOption[];
  combo: Combo | null;
}

/** `app_config.order_rules` yang relevan untuk form. */
export interface OrderRules {
  minQuantity: number;
  maxQuantity: number;
  maxNoteLength: number;
}

export const DEFAULT_ORDER_RULES: OrderRules = { minQuantity: 1, maxQuantity: 20, maxNoteLength: 100 };

export const comboLabel = (c: Combo) =>
  c.items.map((i) => `${i.quantity}× ${i.name}${i.optionName ? ` (${i.optionName})` : ""}`).join(", ");

export interface CatalogRepository {
  stores(near: { lat: number; lng: number } | null): Promise<Store[]>;
  banners(): Promise<Banner[]>;
  categories(): Promise<Category[]>;
  products(storeId: string | null): Promise<Product[]>;
  product(id: string, storeId: string | null): Promise<Product>;
  orderRules(): Promise<OrderRules>;
}
