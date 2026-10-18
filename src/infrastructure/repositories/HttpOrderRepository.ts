import type { OrderRepository } from "@/domain/order/OrderRepository";
import type { AdminOrderDTO, AdminOrderSummaryDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toOrderDetail, toOrderSummary } from "../mappers/mappers";

export class HttpOrderRepository implements OrderRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filter: Parameters<OrderRepository["list"]>[0]) {
    const res = await this.http.get<AdminOrderSummaryDTO[]>("/v1/admin/orders", {
      status: filter.statuses.join(","),
      q: filter.query,
      from: filter.range?.from,
      to: filter.range?.to,
      page: filter.page,
      limit: filter.limit,
    });
    return {
      items: res.data.map(toOrderSummary),
      page: res.meta?.page ?? filter.page,
      limit: res.meta?.limit ?? filter.limit,
      total: res.meta?.total ?? res.data.length,
    };
  }

  async get(id: string) {
    const res = await this.http.get<AdminOrderDTO>(`/v1/admin/orders/${encodeURIComponent(id)}`);
    return toOrderDetail(res.data);
  }

  async changeStatus(change: Parameters<OrderRepository["changeStatus"]>[0]) {
    const res = await this.http.patch<AdminOrderDTO>(`/v1/admin/orders/${encodeURIComponent(change.orderId)}/status`, {
      status: change.status,
      note: change.note,
    });
    return toOrderDetail(res.data);
  }
}
