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
  updatedAt: Date;
}

export interface ProductFilter {
  query: string;
  categoryId: string;
  availability: "all" | "available" | "unavailable";
}

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
