import type { OrderRules, Product, ProductOption } from "@/domain/catalog/Catalog";

/** Baris keranjang (disimpan di browser). Harga di sini hanya perkiraan; total resmi dari quote server. */
export interface CartItem {
  productId: string;
  optionId: string | null;
  name: string;
  optionName: string | null;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  note: string;
}

export const lineKey = (i: Pick<CartItem, "productId" | "optionId" | "note">) => `${i.productId}|${i.optionId ?? "-"}|${i.note}`;

/** `product` cukup id, nama, harga, foto (mis. dari riwayat pesanan untuk "Pesan lagi"). */
export function makeItem(
  product: Pick<Product, "id" | "name" | "price" | "imageUrl">,
  option: Pick<ProductOption, "id" | "name" | "extraPrice"> | null,
  quantity: number,
  note: string,
): CartItem {
  return {
    productId: product.id,
    optionId: option?.id ?? null,
    name: product.name,
    optionName: option?.name ?? null,
    imageUrl: product.imageUrl,
    unitPrice: product.price + (option?.extraPrice ?? 0),
    quantity,
    note: note.trim(),
  };
}

const clamp = (n: number, rules: OrderRules) => Math.min(Math.max(n, rules.minQuantity), rules.maxQuantity);

/** Produk + varian + catatan yang sama digabung; jumlah dibatasi aturan server. */
export function addItem(items: CartItem[], item: CartItem, rules: OrderRules): CartItem[] {
  const key = lineKey(item);
  const existing = items.find((i) => lineKey(i) === key);
  if (!existing) return [...items, { ...item, quantity: clamp(item.quantity, rules) }];
  return items.map((i) => (lineKey(i) === key ? { ...i, quantity: clamp(i.quantity + item.quantity, rules) } : i));
}

/** Jumlah 0 = hapus baris. */
export function setQuantity(items: CartItem[], key: string, quantity: number, rules: OrderRules): CartItem[] {
  if (quantity <= 0) return items.filter((i) => lineKey(i) !== key);
  return items.map((i) => (lineKey(i) === key ? { ...i, quantity: clamp(quantity, rules) } : i));
}

export const itemCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const estimatedSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
