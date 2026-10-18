"use client";

import { ReceiptText, TicketPercent, UtensilsCrossed, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { pageCount } from "@/domain/shared/pagination";
import { formatDateTime } from "@/shared/lib/format";
import { EmptyState, ErrorState, Pagination } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, Skeleton } from "../../components/ui";
import { useAuditLogs } from "../../hooks/useAuditLogs";

const ICON: Record<string, LucideIcon> = { order: ReceiptText, product: UtensilsCrossed, deal: TicketPercent };

export function ActivityView() {
  const [page, setPage] = useState(1);
  const logs = useAuditLogs(page);
  return (
    <>
      <PageHeader title="Aktivitas" description="Semua perubahan dari web admin: status pesanan, harga & stok, dan promo." />
      {logs.isError && <ErrorState error={logs.error} onRetry={() => logs.refetch()} />}
      {logs.isPending && <Skeleton className="h-64 w-full" />}
      {logs.data && (
        <Card>
          {logs.data.items.length === 0 && <EmptyState title="Belum ada aktivitas" description="Perubahan dari web admin akan tercatat di sini." />}
          <ul className="divide-y divide-line">
            {logs.data.items.map((log) => {
              const Icon = ICON[log.entity] ?? ReceiptText;
              return (
                <li key={log.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                  <Icon className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col">
                    {log.entity === "order" ? (
                      <Link href={`/orders/${log.entityId}`} className="font-medium hover:text-brand hover:underline">
                        {log.summary}
                      </Link>
                    ) : (
                      <span className="font-medium">{log.summary}</span>
                    )}
                    <span className="tabular text-xs text-ink-muted">
                      {formatDateTime(log.createdAt)} oleh {log.adminName ?? "admin terhapus"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <Pagination page={page} pageCount={pageCount(logs.data)} onChange={setPage} />
        </Card>
      )}
    </>
  );
}
