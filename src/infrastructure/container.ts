import { makeListAuditLogs } from "@/application/audit/auditUseCases";
import { makeDeleteBanner, makeListBanners, makeSaveBanner, makeToggleBanner } from "@/application/banner/bannerUseCases";
import { makeListAdminCategories, makeSaveCategory } from "@/application/category/categoryUseCases";
import { makeCreateStaff, makeListStaff, makeUpdateStaff } from "@/application/staff/staffUseCases";
import { makeGetCurrentAdmin, makeLogin, makeLogout } from "@/application/auth/authUseCases";
import { makeGetDashboard } from "@/application/dashboard/dashboardUseCases";
import {
  makeGetDeliverySettings,
  makePreviewDeliverySettings,
  makeSaveDeliverySettings,
} from "@/application/delivery/deliveryUseCases";
import { makeDeleteDeal, makeListDeals, makeSaveDeal, makeToggleDeal } from "@/application/deal/dealUseCases";
import { makeChangeOrderStatus, makeGetOrder, makeListOrders } from "@/application/order/orderUseCases";
import { makeGetPayment, makeListPayments, makeRefundPayment } from "@/application/payment/paymentUseCases";
import {
  makeCreateProduct,
  makeListCategories,
  makeListProducts,
  makeUpdateProduct,
} from "@/application/product/productUseCases";
import { makeListStores, makeSaveStore, makeSetStoreProduct, makeSetStoreTempClosed } from "@/application/store/storeUseCases";
import { makeListUsers } from "@/application/user/userUseCases";
import type { AuditLogRepository } from "@/domain/audit/AuditLog";
import type { BannerRepository } from "@/domain/banner/Banner";
import type { AuthRepository } from "@/domain/auth/Auth";
import type { CategoryRepository } from "@/domain/category/Category";
import type { StaffRepository } from "@/domain/staff/Staff";
import type { DashboardRepository } from "@/domain/dashboard/Dashboard";
import type { DealRepository } from "@/domain/deal/DealRepository";
import type { DeliveryRepository } from "@/domain/delivery/DeliverySettings";
import type { OrderRepository } from "@/domain/order/OrderRepository";
import type { PaymentRepository } from "@/domain/payment/Payment";
import type { ProductRepository } from "@/domain/product/ProductRepository";
import type { StoreRepository } from "@/domain/store/Store";
import type { UserRepository } from "@/domain/user/User";
import { createHttpClient } from "./http/httpClient";
import { HttpAuditLogRepository } from "./repositories/HttpAuditLogRepository";
import { HttpBannerRepository } from "./repositories/HttpBannerRepository";
import { HttpAuthRepository } from "./repositories/HttpAuthRepository";
import { HttpCategoryRepository } from "./repositories/HttpCategoryRepository";
import { HttpStaffRepository } from "./repositories/HttpStaffRepository";
import { HttpDashboardRepository } from "./repositories/HttpDashboardRepository";
import { HttpDealRepository } from "./repositories/HttpDealRepository";
import { HttpDeliveryRepository } from "./repositories/HttpDeliveryRepository";
import { HttpOrderRepository } from "./repositories/HttpOrderRepository";
import { HttpPaymentRepository } from "./repositories/HttpPaymentRepository";
import { HttpProductRepository } from "./repositories/HttpProductRepository";
import { HttpStoreRepository } from "./repositories/HttpStoreRepository";
import { HttpUserRepository } from "./repositories/HttpUserRepository";

export interface Repositories {
  orders: OrderRepository;
  payments: PaymentRepository;
  delivery: DeliveryRepository;
  banners: BannerRepository;
  products: ProductRepository;
  deals: DealRepository;
  dashboard: DashboardRepository;
  users: UserRepository;
  stores: StoreRepository;
  auth: AuthRepository;
  audit: AuditLogRepository;
  categories: CategoryRepository;
  staff: StaffRepository;
}

export function createHttpRepositories(): Repositories {
  const backend = createHttpClient("/api/backend");
  const auth = createHttpClient("/api/auth");
  return {
    orders: new HttpOrderRepository(backend),
    payments: new HttpPaymentRepository(backend),
    delivery: new HttpDeliveryRepository(backend),
    banners: new HttpBannerRepository(backend),
    products: new HttpProductRepository(backend),
    deals: new HttpDealRepository(backend),
    dashboard: new HttpDashboardRepository(backend),
    users: new HttpUserRepository(backend),
    stores: new HttpStoreRepository(backend),
    auth: new HttpAuthRepository(auth, backend),
    audit: new HttpAuditLogRepository(backend),
    categories: new HttpCategoryRepository(backend),
    staff: new HttpStaffRepository(backend),
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
    listPayments: makeListPayments(repos.payments),
    getPayment: makeGetPayment(repos.payments),
    refundPayment: makeRefundPayment(repos.payments),
    getDeliverySettings: makeGetDeliverySettings(repos.delivery),
    previewDeliverySettings: makePreviewDeliverySettings(repos.delivery),
    saveDeliverySettings: makeSaveDeliverySettings(repos.delivery),
    listBanners: makeListBanners(repos.banners),
    saveBanner: makeSaveBanner(repos.banners),
    toggleBanner: makeToggleBanner(repos.banners),
    deleteBanner: makeDeleteBanner(repos.banners),
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
    listStores: makeListStores(repos.stores),
    saveStore: makeSaveStore(repos.stores),
    setStoreTempClosed: makeSetStoreTempClosed(repos.stores),
    setStoreProduct: makeSetStoreProduct(repos.stores),
    login: makeLogin(repos.auth),
    logout: makeLogout(repos.auth),
    getCurrentAdmin: makeGetCurrentAdmin(repos.auth),
    listAuditLogs: makeListAuditLogs(repos.audit),
    listAdminCategories: makeListAdminCategories(repos.categories),
    saveCategory: makeSaveCategory(repos.categories),
    listStaff: makeListStaff(repos.staff),
    createStaff: makeCreateStaff(repos.staff),
    updateStaff: makeUpdateStaff(repos.staff),
  };
}

export type Container = ReturnType<typeof createContainer>;
