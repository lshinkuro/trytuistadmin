export interface ProductOption {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  /** Harga normal (yang diubah admin). */
  price: number;
  /** Harga promo yang sedang berlaku, null bila tidak ada. */
  dealPrice: number | null;
  /** Harga yang dibayar pelanggan sekarang. */
  effectivePrice: number;
  imageUrl: string;
  rating: number;
  soldCount: number;
  isAvailable: boolean;
  isBestSeller: boolean;
  options: ProductOption[];
  /** Paket combo: isi tetap (kosong = menu biasa). */
  bundleItems: BundleItem[];
  /** Total harga pusat bila isinya dibeli satuan. */
  separatePrice: number;
  updatedAt: Date;
  /** Hanya saat daftar diminta untuk satu outlet (selalu untuk admin outlet). */
  store?: StoreProduct;
}

/** Menu di satu outlet (§5.29): dijual atau tidak, stok, dan harga khusus outlet. */
export interface StoreProduct {
  storeId: string;
  isListed: boolean;
  /** Saklar "habis" manual. */
  isSoldOut: boolean;
  /** null = stok tidak dihitung. */
  stock: number | null;
  /** Harga khusus outlet; null = harga pusat. */
  price: number | null;
  /** Promo aktif di outlet ini (promo pusat atau outlet). */
  dealPrice: number | null;
  effectivePrice: number;
  /** Bisa dipesan pelanggan sekarang. */
  isAvailable: boolean;
}

export interface ProductFilter {
  query: string;
  categoryId: string;
  availability: "all" | "available" | "unavailable";
  /** Kosong = katalog pusat (semua outlet). Admin outlet selalu outletnya. */
  storeId: string;
}

export interface BundleItem {
  productId: string;
  productName: string;
  optionId: string | null;
  optionName: string | null;
  quantity: number;
  /** Harga pusat + varian. */
  unitPrice: number;
}

/** Isi paket di form. */
export interface BundleItemInput {
  productId: string;
  optionId: string | null;
  quantity: number;
}

export const MAX_BUNDLE_ITEMS = 10;
export const MAX_BUNDLE_QUANTITY = 10;

/** Varian di form. `id` kosong = varian baru (id dibuat server dari nama). */
export interface ProductOptionInput {
  id?: string;
  name: string;
  extraPrice: number;
}

/** Data form "Tambah menu" / "Ubah menu". */
export interface ProductInput {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  options: ProductOptionInput[];
  /** Kosong = menu biasa. Isi tidak boleh paket lain / dirinya sendiri (dicek server). */
  bundleItems: BundleItemInput[];
}

/** Field yang tidak diisi tidak diubah. `options` diisi = daftar varian diganti seluruhnya. */
export type ProductUpdate = { id: string } & Partial<ProductInput>;

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const MAX_PRICE = 10_000_000;
export const MAX_OPTIONS = 10;
export const MAX_OPTION_EXTRA = 1_000_000;
