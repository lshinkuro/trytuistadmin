import type { PaymentRepository } from "@/domain/payment/Payment";
import type { AdminPaymentDTO, AdminPaymentSummaryDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toPaymentDetail, toPaymentSummary } from "../mappers/mappers";

export class HttpPaymentRepository implements PaymentRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filter: Parameters<PaymentRepository["list"]>[0]) {
    const res = await this.http.get<AdminPaymentSummaryDTO[]>("/v1/admin/payments", {
      status: filter.statuses.join(","),
      q: filter.query,
      from: filter.range?.from,
      to: filter.range?.to,
      store_id: filter.storeId,
      refund: filter.refundOnly ? "1" : undefined,
      page: filter.page,
      limit: filter.limit,
    });
    return {
      items: res.data.map(toPaymentSummary),
      page: res.meta?.page ?? filter.page,
      limit: res.meta?.limit ?? filter.limit,
      total: res.meta?.total ?? res.data.length,
    };
  }

  async get(id: string) {
    const res = await this.http.get<AdminPaymentDTO>(`/v1/admin/payments/${encodeURIComponent(id)}`);
    return toPaymentDetail(res.data);
  }

  async refund(input: Parameters<PaymentRepository["refund"]>[0]) {
    const res = await this.http.post<AdminPaymentDTO>(`/v1/admin/payments/${encodeURIComponent(input.paymentId)}/refund`, {
      amount: input.amount ?? 0,
      reason: input.reason,
      manual: input.manual,
    });
    return toPaymentDetail(res.data);
  }
}
