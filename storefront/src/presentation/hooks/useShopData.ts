"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { AddressInput } from "@/domain/account/Account";
import type { OrderDetail, QuoteRequest } from "@/domain/order/Order";
import { useDependencies } from "../providers/DependenciesProvider";
import { useShop } from "../providers/ShopProvider";

/** Profil = penanda login. 401 (tamu) tidak dianggap error di halaman katalog. */
export function useMe() {
  const { account } = useDependencies();
  return useQuery({ queryKey: ["me"], queryFn: () => account.me(), retry: false, staleTime: 5 * 60_000 });
}

/** Outlet aktif: pilihan tersimpan, atau outlet pertama dari server (buka & menjangkau lebih dulu). */
export function useOutlet() {
  const { catalog } = useDependencies();
  const { storeId, setStoreId, ready } = useShop();
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => catalog.stores(null), staleTime: 5 * 60_000 });
  const list = useMemo(() => stores.data ?? [], [stores.data]);
  const selected = list.find((s) => s.id === storeId) ?? null;
  useEffect(() => {
    if (ready && list.length > 0 && !selected) setStoreId(list[0]!.id);
  }, [ready, list, selected, setStoreId]);
  return { stores, selected, storeId: selected?.id ?? null, select: setStoreId };
}

/** Aturan jumlah/catatan dari app-config disimpan di ShopProvider (dipakai keranjang). */
export function useOrderRules() {
  const { catalog } = useDependencies();
  const { setRules } = useShop();
  const q = useQuery({ queryKey: ["order-rules"], queryFn: () => catalog.orderRules(), staleTime: 10 * 60_000 });
  useEffect(() => {
    if (q.data) setRules(q.data);
  }, [q.data, setRules]);
  return q.data;
}

export function useHomeData(storeId: string | null) {
  const { catalog } = useDependencies();
  const banners = useQuery({ queryKey: ["banners"], queryFn: () => catalog.banners() });
  const categories = useQuery({ queryKey: ["categories"], queryFn: () => catalog.categories(), staleTime: 10 * 60_000 });
  const products = useQuery({
    queryKey: ["products", storeId],
    queryFn: () => catalog.products(storeId),
    enabled: storeId !== null,
    placeholderData: keepPreviousData,
  });
  return { banners, categories, products };
}

export function useProduct(id: string, storeId: string | null) {
  const { catalog } = useDependencies();
  return useQuery({ queryKey: ["product", id, storeId], queryFn: () => catalog.product(id, storeId), enabled: storeId !== null });
}

export function useQuote(req: QuoteRequest | null) {
  const { quote } = useDependencies();
  return useQuery({
    queryKey: ["quote", req],
    queryFn: () => quote(req!),
    enabled: req !== null && req.items.length > 0,
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCheckout() {
  const { checkout } = useDependencies();
  return useMutation({ mutationFn: checkout });
}

export function usePayment(id: string) {
  const { orders } = useDependencies();
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => orders.payment(id),
    // Polling sampai final; backend ikut cek ke Midtrans saat PENDING.
    refetchInterval: (q) => (q.state.data?.status === "PENDING" || !q.state.data ? 3000 : false),
  });
}

export function useCancelPayment() {
  const { orders } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orders.cancelPayment(id),
    onSuccess: (p) => client.setQueryData(["payment", p.id], p),
  });
}

export function useOrders(page: number) {
  const { orders } = useDependencies();
  return useQuery({ queryKey: ["orders", page], queryFn: () => orders.list(page), placeholderData: keepPreviousData, refetchInterval: 30_000 });
}

export function useOrder(id: string) {
  const { orders } = useDependencies();
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orders.get(id),
    refetchInterval: (q) => (q.state.data && ["COMPLETED", "CANCELLED", "FAILED"].includes(q.state.data.status) ? false : 15_000),
  });
}

function useOrderMutation<T>(fn: (v: T) => Promise<OrderDetail>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (order) => {
      client.setQueryData(["order", order.id], order);
      void client.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const { orders } = useDependencies();
  return useOrderMutation((id: string) => orders.cancel(id));
}

export function useRateOrder() {
  const { rateOrder } = useDependencies();
  return useOrderMutation(rateOrder);
}

export function useAddresses(enabled = true) {
  const { account } = useDependencies();
  return useQuery({ queryKey: ["addresses"], queryFn: () => account.addresses(), enabled });
}

export function useSaveAddress() {
  const { saveAddress } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string | null; input: AddressInput }) => saveAddress(v),
    onSuccess: () => client.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const { account } = useDependencies();
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => account.deleteAddress(id), onSuccess: () => client.invalidateQueries({ queryKey: ["addresses"] }) });
}

export function usePaymentMethods(enabled = true) {
  const { account } = useDependencies();
  return useQuery({ queryKey: ["payment-methods"], queryFn: () => account.paymentMethods(), enabled });
}

export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
