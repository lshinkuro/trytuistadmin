import type { AccountRepository } from "@/domain/account/Account";
import { DEFAULT_ORDER_RULES, type CatalogRepository } from "@/domain/catalog/Catalog";
import type { CheckoutResult, OrderRepository } from "@/domain/order/Order";
import type { HttpClient } from "../http/httpClient";
import * as m from "../mappers/mappers";

/* eslint-disable @typescript-eslint/no-explicit-any -- respons backend dipetakan di mappers */
type Json = any;

export class HttpCatalogRepository implements CatalogRepository {
  constructor(private readonly http: HttpClient) {}

  async stores(near: { lat: number; lng: number } | null) {
    return (await this.http.get<Json[]>("/v1/stores", near ?? {})).data.map(m.toStore);
  }
  async banners() {
    return (await this.http.get<Json[]>("/v1/banners")).data.map(m.toBanner);
  }
  async categories() {
    return (await this.http.get<Json[]>("/v1/categories")).data.map(m.toCategory);
  }
  async products(storeId: string | null) {
    return (await this.http.get<Json[]>("/v1/products", { store_id: storeId, limit: 100 })).data.map(m.toProduct);
  }
  async product(id: string, storeId: string | null) {
    return m.toProduct((await this.http.get<Json>(`/v1/products/${encodeURIComponent(id)}`, { store_id: storeId })).data);
  }
  async orderRules() {
    const rules = (await this.http.get<Json>("/v1/app-config")).data?.order_rules;
    return rules
      ? { minQuantity: rules.min_quantity, maxQuantity: rules.max_quantity, maxNoteLength: rules.max_note_length }
      : DEFAULT_ORDER_RULES;
  }
}

export class HttpOrderRepository implements OrderRepository {
  constructor(private readonly http: HttpClient) {}

  async quote(req: Parameters<OrderRepository["quote"]>[0]) {
    return m.toQuote((await this.http.post<Json>("/v1/orders/quote", m.toQuoteBody(req))).data);
  }
  async checkout(req: Parameters<OrderRepository["checkout"]>[0], idempotencyKey: string): Promise<CheckoutResult> {
    const body = { ...m.toQuoteBody(req), ...(req.paymentMethodId ? { payment_method_id: req.paymentMethodId } : {}) };
    const data = (await this.http.post<Json>("/v1/checkout", body, { "Idempotency-Key": idempotencyKey })).data;
    return data.next === "PAYMENT"
      ? { next: "PAYMENT", payment: m.toPayment(data.payment) }
      : { next: "ORDER", orderId: data.order.order_id };
  }
  async payment(id: string) {
    return m.toPayment((await this.http.get<Json>(`/v1/payments/${encodeURIComponent(id)}`)).data);
  }
  async cancelPayment(id: string) {
    return m.toPayment((await this.http.post<Json>(`/v1/payments/${encodeURIComponent(id)}/cancel`)).data);
  }
  async list(page: number) {
    const res = await this.http.get<Json[]>("/v1/orders", { page, limit: 20, sort: "desc" });
    return { items: res.data.map(m.toOrderSummary), total: res.meta?.total ?? res.data.length };
  }
  async get(id: string) {
    return m.toOrderDetail((await this.http.get<Json>(`/v1/orders/${encodeURIComponent(id)}`)).data);
  }
  async cancel(id: string) {
    return m.toOrderDetail((await this.http.post<Json>(`/v1/orders/${encodeURIComponent(id)}/cancel`)).data);
  }
  async rate(id: string, rating: number, comment: string) {
    return m.toOrderDetail((await this.http.post<Json>(`/v1/orders/${encodeURIComponent(id)}/rating`, { rating, comment })).data);
  }
}

export class HttpAccountRepository implements AccountRepository {
  constructor(private readonly http: HttpClient) {}

  async me() {
    return m.toProfile((await this.http.get<Json>("/v1/me")).data);
  }
  async addresses() {
    return (await this.http.get<Json[]>("/v1/me/addresses")).data.map(m.toAddress);
  }
  async createAddress(input: Parameters<AccountRepository["createAddress"]>[0]) {
    return m.toAddress((await this.http.post<Json>("/v1/me/addresses", m.toAddressBody(input))).data);
  }
  async updateAddress(id: string, input: Parameters<AccountRepository["updateAddress"]>[1]) {
    return m.toAddress((await this.http.patch<Json>(`/v1/me/addresses/${encodeURIComponent(id)}`, m.toAddressBody(input))).data);
  }
  async deleteAddress(id: string) {
    await this.http.delete(`/v1/me/addresses/${encodeURIComponent(id)}`);
  }
  async paymentMethods() {
    const d = (await this.http.get<Json>("/v1/me/payment-methods")).data;
    return { defaultId: d.default_id, methods: (d.methods ?? []).map(m.toPaymentMethod) };
  }
}
