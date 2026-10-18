import type { Paginated } from "@/domain/shared/pagination";

export interface AuditLog {
  id: string;
  action: string;
  entity: "order" | "product" | "deal" | string;
  entityId: string;
  summary: string;
  adminName: string | null;
  createdAt: Date;
}

export interface AuditLogRepository {
  list(page: number, limit: number): Promise<Paginated<AuditLog>>;
}
