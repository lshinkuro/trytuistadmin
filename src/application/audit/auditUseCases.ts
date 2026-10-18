import type { AuditLogRepository } from "@/domain/audit/AuditLog";

export function makeListAuditLogs(repo: AuditLogRepository) {
  return ({ page, limit }: { page: number; limit: number }) => repo.list(page, limit);
}
