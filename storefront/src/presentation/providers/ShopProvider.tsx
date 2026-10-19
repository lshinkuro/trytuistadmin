"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_ORDER_RULES, type OrderRules } from "@/domain/catalog/Catalog";
import { addItem, itemCount, setQuantity, type CartItem } from "@/domain/cart/Cart";

// Outlet terpilih & keranjang disimpan di browser (sama seperti app iOS). Harga resmi selalu dari quote server.
const STORE_KEY = "tt_shop_store";
const CART_KEY = "tt_shop_cart";

interface ShopState {
  storeId: string | null;
  setStoreId: (id: string) => void;
  cart: CartItem[];
  cartCount: number;
  rules: OrderRules;
  setRules: (rules: OrderRules) => void;
  add: (item: CartItem) => void;
  setQty: (key: string, quantity: number) => void;
  clear: () => void;
  /** localStorage sudah dibaca (hindari keranjang kosong sesaat saat halaman dimuat). */
  ready: boolean;
}

const ShopContext = createContext<ShopState | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage diblokir (mode privat): keranjang tetap jalan di memori
  }
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [storeId, setStore] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [rules, setRules] = useState<OrderRules>(DEFAULT_ORDER_RULES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- baca storage sekali setelah hydrate
    setStore(read<string | null>(STORE_KEY, null));
    setCart(read<CartItem[]>(CART_KEY, []));
    setReady(true);
  }, []);

  const update = useCallback((next: (items: CartItem[]) => CartItem[]) => {
    setCart((items) => {
      const value = next(items);
      write(CART_KEY, value);
      return value;
    });
  }, []);

  const value = useMemo<ShopState>(
    () => ({
      storeId,
      setStoreId: (id) => {
        setStore(id);
        write(STORE_KEY, id);
      },
      cart,
      cartCount: itemCount(cart),
      rules,
      setRules,
      add: (item) => update((items) => addItem(items, item, rules)),
      setQty: (key, quantity) => update((items) => setQuantity(items, key, quantity, rules)),
      clear: () => update(() => []),
      ready,
    }),
    [storeId, cart, rules, ready, update],
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop harus dipakai di dalam <ShopProvider>.");
  return value;
}
