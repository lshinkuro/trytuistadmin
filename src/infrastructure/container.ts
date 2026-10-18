import { makeListAuditLogs } from "@/application/audit/auditUseCases";
import { makeGetCurrentAdmin, makeLogin, makeLogout } from "@/application/auth/authUseCases";
import { makeGetDashboard } from "@/application/dashboard/dashboardUseCases";
import { makeDeleteDeal, makeListDeals, makeSaveDeal, makeToggleDeal } from "@/application/deal/dealUseCases";
import { makeChangeOrderStatus, makeGetOrder, makeListOrders } from "@/application/order/orderUseCases";
import {
  makeCreateProduct,
  makeListCategories,
  makeListProducts,
  makeUpdateProduct,
} from "@/application/product/productUseCases";
import { makeListUsers } from "@/application/user/userUseCases";
import type { AuditLogRepository } from "@/domain/audit/AuditLog";
import type { AuthRepository } from "@/domain/auth/Auth";
import type { DashboardRepository } from "@/domain/dashboard/Dashboard";
import type { DealRepository } from "@/domain/deal/DealRepository";
import type { OrderRepository } from "@/domain/order/OrderRepository";
import type { ProductRepository } from "@/domain/product/ProductRepository";
import type { UserRepository } from "@/domain/user/User";
import { createHttpClient } from "./http/httpClient";
import { HttpAuditLogRepository } from "./repositories/HttpAuditLogRepository";
import { HttpAuthRepository } from "./repositories/HttpAuthRepository";
import { HttpDashboardRepository } from "./repositories/HttpDashboardRepository";
import { HttpDealRepository } from "./repositories/HttpDealRepository";
import { HttpOrderRepository } from "./repositories/HttpOrderRepository";
import { HttpProductRepository } from "./repositories/HttpProductRepository";
import { HttpUserRepository } from "./repositories/HttpUserRepository";

export interface Repositories {
  orders: OrderRepository;
  products: ProductRepository;
  deals: DealRepository;
  dashboard: DashboardRepository;
  users: UserRepository;
  auth: AuthRepository;
  audit: AuditLogRepository;
}

export function createHttpRepositories(): Repositories {
  const backend = createHttpClient("/api/backend");
  const auth = createHttpClient("/api/auth");
  return {
    orders: new HttpOrderRepository(backend),
    products: new HttpProductRepository(backend),
    deals: new HttpDealRepository(backend),
    dashboard: new HttpDashboardRepository(backend),
    users: new HttpUserRepository(backend),
    auth: new HttpAuthRepository(auth, backend),
    audit: new HttpAuditLogRepository(backend),
  };
}

/**
 * Composition root: satu-satunya tempat repository dipilih. Ganti sumber data (mock, GraphQL,
 * backend lain) cukup dengan memberi `Repositories` lain; use case & UI tidak berubah.
 */
export function createContainer(repos: Repositories = createHttpRepositories()) {
  return {
    listOrders: makeListOrders(repos.orders),
    getOrder: makeGetOrder(repos.orders),
    changeOrderStatus: makeChangeOrderStatus(repos.orders),
    listProducts: makeListProducts(repos.products),
    listCategories: makeListCategories(repos.products),
    createProduct: makeCreateProduct(repos.products),
    updateProduct: makeUpdateProduct(repos.products),
    listDeals: makeListDeals(repos.deals),
    saveDeal: makeSaveDeal(repos.deals),
    toggleDeal: makeToggleDeal(repos.deals),
    deleteDeal: makeDeleteDeal(repos.deals),
    getDashboard: makeGetDashboard(repos.dashboard),
    listUsers: makeListUsers(repos.users),
    login: makeLogin(repos.auth),
    logout: makeLogout(repos.auth),
    getCurrentAdmin: makeGetCurrentAdmin(repos.auth),
    listAuditLogs: makeListAuditLogs(repos.audit),
  };
}

export type Container = ReturnType<typeof createContainer>;
