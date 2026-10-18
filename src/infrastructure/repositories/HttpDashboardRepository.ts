import type { DashboardRepository } from "@/domain/dashboard/Dashboard";
import type { DateRange } from "@/domain/shared/dateRange";
import type { DashboardDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toDashboard } from "../mappers/mappers";

export class HttpDashboardRepository implements DashboardRepository {
  constructor(private readonly http: HttpClient) {}

  async get(range: DateRange) {
    const res = await this.http.get<DashboardDTO>("/v1/admin/dashboard", { from: range.from, to: range.to });
    return toDashboard(res.data);
  }
}
