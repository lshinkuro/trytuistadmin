"use client";

import { Megaphone, Plus } from "lucide-react";
import { useState } from "react";
import { DEAL_STATUS_LABEL, type Deal, type DealStatus } from "@/domain/deal/Deal";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge, Button, Card, Dialog, Skeleton, Switch, type BadgeProps } from "../../components/ui";
import { useDeals, useDeleteDeal, useToggleDeal } from "../../hooks/useDeals";
import { DealFormDialog } from "./DealFormDialog";

const TONE: Record<DealStatus, NonNullable<BadgeProps["tone"]>> = {
  ACTIVE: "success",
  SCHEDULED: "info",
  EXPIRED: "neutral",
  INACTIVE: "neutral",
};

export function DealsView() {
  const deals = useDeals();
  const toggle = useToggleDeal();
  const remove = useDeleteDeal();
  const [editing, setEditing] = useState<Deal | null | "new">(null);
  const [deleting, setDeleting] = useState<Deal | null>(null);

  return (
    <>
      <PageHeader
        title="Promo"
        description="Potongan harga per produk. Promo yang ditandai popup muncul di Beranda aplikasi (satu yang urutannya paling kecil)."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden /> Promo baru
          </Button>
        }
      />
      {deals.isError && <ErrorState error={deals.error} onRetry={() => deals.refetch()} />}
      {deals.isPending && <Skeleton className="h-64 w-full" />}
      {deals.data && (
        <Card className="divide-y divide-line">
          {deals.data.length === 0 && (
            <EmptyState
              title="Belum ada promo"
              description="Buat promo pertama untuk menurunkan harga menu tertentu dalam periode tertentu."
              action={<Button onClick={() => setEditing("new")}>Buat promo</Button>}
            />
          )}
          {deals.data.map((deal) => (
            <div key={deal.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-control bg-brand-soft text-brand">
                  <span className="tabular text-lg leading-none font-extrabold">{deal.discountPercent}%</span>
                  <span className="text-[0.6875rem] font-semibold">hemat</span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{deal.title}</span>
                    <Badge tone={TONE[deal.status]} dot>
                      {DEAL_STATUS_LABEL[deal.status]}
                    </Badge>
                    {deal.showAsPopup && (
                      <Badge tone="brand">
                        <Megaphone className="size-3" aria-hidden /> Popup Beranda
                      </Badge>
                    )}
                    <Badge tone={deal.store ? "info" : "neutral"}>{deal.store ? deal.store.name : "Semua outlet"}</Badge>
                  </div>
                  <span className="text-sm text-ink-muted">
                    {deal.productName}:{" "}
                    <span className="tabular line-through">{formatRupiah(deal.productPrice)}</span>{" "}
                    <span className="tabular font-semibold text-ink">{formatRupiah(deal.dealPrice)}</span>
                  </span>
                  <span className="tabular text-xs text-ink-muted">
                    {formatDateTime(deal.startsAt)} – {formatDateTime(deal.endsAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <Switch
                  label={deal.isActive ? "Aktif" : "Nonaktif"}
                  checked={deal.isActive}
                  disabled={!deal.canEdit || (toggle.isPending && toggle.variables?.id === deal.id)}
                  onChange={(e) => toggle.mutate({ id: deal.id, isActive: e.target.checked })}
                  aria-label={`Aktifkan promo ${deal.title}`}
                  className="mr-2"
                />
                {deal.canEdit ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditing(deal)}>
                      Ubah
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:text-danger" onClick={() => setDeleting(deal)}>
                      Hapus
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-ink-muted">Promo pusat</span>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {editing && <DealFormDialog key={editing === "new" ? "new" : editing.id} deal={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Hapus promo?"
        description={deleting ? `"${deleting.title}" dihapus permanen. Harga ${deleting.productName} kembali normal.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Batal
            </Button>
            <Button
              variant="danger"
              isLoading={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
            >
              Hapus promo
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">Kalau hanya ingin menghentikan sementara, matikan saja promonya.</p>
      </Dialog>
    </>
  );
}
