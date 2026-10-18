import type { Paginated } from "@/domain/shared/pagination";
import type { OrderDetail, OrderFilter, OrderSummary, StatusChange } from "./Order";

export interface OrderRepository {
  list(filter: OrderFilter): Promise<Paginated<OrderSummary>>;
  get(id: string): Promise<OrderDetail>;
  changeStatus(change: StatusChange): Promise<OrderDetail>;
}
