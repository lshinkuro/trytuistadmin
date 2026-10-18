"use client";

import { MapPin, Phone, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { STORE_STATUS_LABEL, storeStatus, type Store, type StoreStatus } from "@/domain/store/Store";
import { formatNumber, formatRupiah } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge, Button, Card, Skeleton, Switch, type BadgeProps } from "../../components/ui";
import { useSetStoreTempClosed, useStores } from "../../hooks/useStores";
import { StoreFormDialog } from "./StoreFormDialog";

const TONE: Record<StoreStatus, NonNullable<BadgeProps["tone"]>> = {
  OPEN: "success",
  OUTSIDE_HOURS: "neutral",
  TEMP_CLOSED: "danger",
  INACTIVE: "neutral",
};

export function StoresView() {
  const stores = useStores();
  const tempClose = useSetStoreTempClosed();
  const [editing, setEditing] = useState<Store | "new" | null>(null);

  return (
    <>
      <PageHeader
        title="Outlet"
        description="Aplikasi otomatis memilih outlet yang buka dan menjangkau alamat pelanggan, lalu yang terdekat. Harga menu sama di semua outlet."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden /> Tambah outlet
          </Button>
        }
      />
      {stores.isError && <ErrorState error={stores.error} onRetry={() => stores.refetch()} />}
      {stores.isPending && <Skeleton className="h-64 w-full" />}
      {stores.data && (
        <Card className="divide-y divide-line">
          {stores.data.length === 0 && (
            <EmptyState title="Belum ada outlet" action={<Button onClick={() => setEditing("new")}>Tambah outlet</Button>} />
          )}
          {stores.data.map((s) => {
            const status = storeStatus(s);
            return (
              <div key={s.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-xs text-ink-faint">{s.id}</span>
                    <Badge tone={TONE[status]} dot>
                      {STORE_STATUS_LABEL[status]}
                    </Badge>
                  </div>
                  <span className="flex items-start gap-1.5 text-sm text-ink-muted">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {s.address}
                  </span>
                  <span className="tabular text-xs text-ink-muted">
                    Buka {s.hoursLabel} · antar sampai {s.deliveryRadiusKm.toLocaleString("id-ID")} km
                    {s.phone && (
                      <>
                        {" "}
                        · <Phone className="inline size-3" aria-hidden /> {s.phone}
                      </>
                    )}
                  </span>
                </div>
                <dl className="tabular grid grid-cols-3 gap-4 text-sm lg:w-80">
                  <div>
                    <dt className="text-xs text-ink-muted">Pesanan hari ini</dt>
                    <dd className="font-semibold">
                      <Link href={`/orders?store=${s.id}&status=all`} className="hover:text-brand hover:underline">
                        {formatNumber(s.today.orders)}
                      </Link>
                      {s.today.active > 0 && <span className="ml-1 text-xs font-normal text-warning">{s.today.active} aktif</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">Penjualan</dt>
                    <dd className="font-semibold">{formatRupiah(s.today.revenue)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">Menu habis</dt>
                    <dd className="font-semibold">
                      <Link href={`/products?store=${s.id}`} className="hover:text-brand hover:underline">
                        {s.unavailableProducts}
                      </Link>
                    </dd>
                  </div>
                </dl>
                <div className="flex items-center gap-3 lg:justify-end">
                  <Switch
                    label={s.isTemporarilyClosed ? "Tutup sementara" : "Terima pesanan"}
                    checked={!s.isTemporarilyClosed}
                    disabled={!s.isActive || (tempClose.isPending && tempClose.variables?.id === s.id)}
                    onChange={(e) => tempClose.mutate({ id: s.id, closed: !e.target.checked })}
                    aria-label={`Terima pesanan di ${s.name}`}
                  />
                  <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                    Ubah
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}
      {editing && (
        <StoreFormDialog key={editing === "new" ? "new" : editing.id} store={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
