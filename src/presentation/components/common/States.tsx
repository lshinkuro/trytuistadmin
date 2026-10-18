import { AlertTriangle, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { AppError } from "@/domain/shared/errors";
import { Button } from "../ui";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof AppError ? error.message : "Terjadi kesalahan. Coba muat ulang.";
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-panel border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
      <span className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="size-4" aria-hidden /> {message}
      </span>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <Inbox className="size-6 text-ink-faint" aria-hidden />
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  );
}

export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-ink-muted">
      <span className="tabular">
        Halaman {page} dari {pageCount}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Sebelumnya
        </Button>
        <Button size="sm" variant="outline" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          Berikutnya
        </Button>
      </div>
    </div>
  );
}
