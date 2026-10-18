import type { DealInput } from "@/domain/deal/Deal";
import type { DealRepository } from "@/domain/deal/DealRepository";
import type { DealDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toDeal, toDealBody } from "../mappers/mappers";

export class HttpDealRepository implements DealRepository {
  constructor(private readonly http: HttpClient) {}

  async list() {
    const res = await this.http.get<DealDTO[]>("/v1/admin/deals");
    return res.data.map(toDeal);
  }

  async create(input: DealInput) {
    const res = await this.http.post<DealDTO>("/v1/admin/deals", toDealBody(input));
    return toDeal(res.data);
  }

  async update(id: string, input: Partial<DealInput>) {
    const res = await this.http.patch<DealDTO>(`/v1/admin/deals/${encodeURIComponent(id)}`, toDealBody(input));
    return toDeal(res.data);
  }

  async remove(id: string) {
    await this.http.delete(`/v1/admin/deals/${encodeURIComponent(id)}`);
  }
}
