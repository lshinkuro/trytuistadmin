import type { AuditLogRepository } from "@/domain/audit/AuditLog";
import type { AuditLogDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toAuditLog } from "../mappers/mappers";

export class HttpAuditLogRepository implements AuditLogRepository {
  constructor(private readonly http: HttpClient) {}

  async list(page: number, limit: number) {
    const res = await this.http.get<AuditLogDTO[]>("/v1/admin/audit-logs", { page, limit });
    return { items: res.data.map(toAuditLog), page, limit, total: res.meta?.total ?? res.data.length };
  }
}
