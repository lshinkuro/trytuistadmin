"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { BANNER_ACTION_LABEL, BANNER_STATUS_LABEL, type Banner, type BannerStatus } from "@/domain/banner/Banner";
import { formatDateTime } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge, Button, Card, Dialog, Skeleton, Switch, type BadgeProps } from "../../components/ui";
import { useBanners, useDeleteBanner, useToggleBanner } from "../../hooks/useBanners";
import { BannerFormDialog } from "./BannerFormDialog";

const TONE: Record<BannerStatus, NonNullable<BadgeProps["tone"]>> = {
  LIVE: "success",
  SCHEDULED: "info",
  ENDED: "neutral",
  INACTIVE: "neutral",
  HIDDEN: "warning",
};

/** Kenapa banner tidak tampil walau aktif. */
const HIDDEN_REASON: Record<string, string> = {
  FREE_DELIVERY: "Kupon gratis ongkir sedang dimatikan (menu Ongkir).",
  PRODUCT: "Menu tujuan sudah dihapus atau kategorinya nonaktif.",
  CATEGORY: "Kategori tujuan nonaktif.",
};

export function BannersView() {
  const banners = useBanners();
  const toggle = useToggleBanner();
  const remove = useDeleteBanner();
  const [editing, setEditing] = useState<Banner | null | "new">(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);

  return (
    <>
      <PageHeader
        title="Banner"
        description="Banner di Beranda aplikasi. Setiap banner bisa membuka menu, kategori, atau info kupon gratis ongkir saat di-tap; banner yang tujuannya tidak berlaku otomatis disembunyikan."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden /> Banner baru
          </Button>
        }
      />
      {banners.isError && <ErrorState error={banners.error} onRetry={() => banners.refetch()} />}
      {banners.isPending && <Skeleton className="h-64 w-full" />}
      {banners.data && (
        <Card className="divide-y divide-line">
          {banners.data.length === 0 && (
            <EmptyState
              title="Belum ada banner"
              description="Beranda aplikasi tidak menampilkan carousel promo sampai ada banner aktif."
              action={<Button onClick={() => setEditing("new")}>Buat banner</Button>}
            />
          )}
          {banners.data.map((b) => (
            <div key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt="" className="h-16 w-28 shrink-0 rounded-control object-cover" loading="lazy" />
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{b.title}</span>
                    <Badge tone={TONE[b.status]} dot>
                      {BANNER_STATUS_LABEL[b.status]}
                    </Badge>
                    <span className="tabular text-xs text-ink-faint">#{b.sortOrder}</span>
                  </div>
                  {b.subtitle && <span className="text-sm text-ink-muted">{b.subtitle}</span>}
                  <span className="flex items-center gap-1 text-sm">
                    <ArrowRight className="size-3.5 text-ink-faint" aria-hidden />
                    {BANNER_ACTION_LABEL[b.actionType]}
                    {b.actionLabel && <span className="font-semibold">: {b.actionLabel}</span>}
                  </span>
                  {b.status === "HIDDEN" && (
                    <span className="text-xs text-warning">{HIDDEN_REASON[b.actionType] ?? "Tujuan banner tidak berlaku."}</span>
                  )}
                  <span className="tabular text-xs text-ink-muted">
                    {b.startsAt || b.endsAt
                      ? `${b.startsAt ? formatDateTime(b.startsAt) : "Sekarang"} – ${b.endsAt ? formatDateTime(b.endsAt) : "tanpa batas"}`
                      : "Tanpa batas waktu"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <Switch
                  label={b.isActive ? "Aktif" : "Nonaktif"}
                  checked={b.isActive}
                  disabled={toggle.isPending && toggle.variables?.id === b.id}
                  onChange={(e) => toggle.mutate({ id: b.id, isActive: e.target.checked })}
                  aria-label={`Aktifkan banner ${b.title}`}
                  className="mr-2"
                />
                <Button size="sm" variant="outline" onClick={() => setEditing(b)}>
                  Ubah
                </Button>
                <Button size="sm" variant="ghost" className="hover:text-danger" onClick={() => setDeleting(b)}>
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {editing && (
        <BannerFormDialog key={editing === "new" ? "new" : editing.id} banner={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}

      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Hapus banner?"
        description={deleting ? `"${deleting.title}" dihapus permanen dari Beranda aplikasi.` : undefined}
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
              Hapus banner
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">Kalau hanya ingin menghentikan sementara, matikan saja banner-nya.</p>
      </Dialog>
    </>
  );
}
