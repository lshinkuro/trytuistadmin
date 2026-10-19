import { makeCheckout, makeQuote, makeRateOrder, makeSaveAddress } from "@/application/shopUseCases";
import type { AccountRepository } from "@/domain/account/Account";
import type { CatalogRepository } from "@/domain/catalog/Catalog";
import type { OrderRepository } from "@/domain/order/Order";
import { createHttpClient } from "./http/httpClient";
import { HttpAccountRepository, HttpCatalogRepository, HttpOrderRepository } from "./repositories/HttpShopRepositories";

/** Composition root: satu-satunya tempat repository dipilih. */
export function createContainer() {
  const http = createHttpClient("/api/backend");
  const catalog: CatalogRepository = new HttpCatalogRepository(http);
  const orders: OrderRepository = new HttpOrderRepository(http);
  const account: AccountRepository = new HttpAccountRepository(http);
  return {
    catalog,
    orders,
    account,
    quote: makeQuote(orders),
    checkout: makeCheckout(orders),
    rateOrder: makeRateOrder(orders),
    saveAddress: makeSaveAddress(account),
    /** Auth lewat route BFF sendiri (bukan proxy backend). */
    auth: createHttpClient("/api/auth"),
  };
}

export type Container = ReturnType<typeof createContainer>;
