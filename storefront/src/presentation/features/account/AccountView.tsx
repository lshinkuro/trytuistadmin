"use client";

import { LogOut, MapPin, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Address, AddressInput } from "@/domain/account/Account";
import { AppError } from "@/domain/shared/errors";
import { ErrorState } from "../../components/common/States";
import { Button, Card, Dialog, Field, Input, Skeleton, Switch, Textarea } from "../../components/ui";
import { useDeleteAddress, useAddresses, useMe, useSaveAddress } from "../../hooks/useShopData";
import { useDependencies } from "../../providers/DependenciesProvider";

export function AccountView() {
  const me = useMe();
  const addresses = useAddresses();
  const remove = useDeleteAddress();
  const { auth } = useDependencies();
  const [editing, setEditing] = useState<Address | null | "new">(useSearchParams().get("alamat") === "baru" ? "new" : null);

  const logout = async () => {
    await auth.post("/logout").catch(() => undefined);
    // Muat ulang penuh: cache query milik sesi lama ikut dibuang.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  };

  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-extrabold">Akun</h1>
      <Card className="flex flex-col p-4">
        {me.data ? (
          <>
            <span className="text-lg font-bold">{me.data.name}</span>
            <span className="text-sm text-ink-muted">{me.data.email}</span>
            {me.data.phone && <span className="text-sm text-ink-muted">{me.data.phone}</span>}
          </>
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-bold">Alamat pengiriman</h2>
        <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
          <Plus aria-hidden /> Tambah
        </Button>
      </div>
      {addresses.isPending && <Skeleton className="h-20 w-full" />}
      {addresses.data?.length === 0 && <p className="text-sm text-ink-muted">Belum ada alamat. Tambahkan supaya bisa memesan antar.</p>}
      {addresses.data?.map((a) => (
        <Card key={a.id} className="flex items-start gap-3 p-4 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold">
              {a.label} · {a.recipient} {a.isDefault && <span className="ml-1 rounded-full bg-brand-soft px-1.5 text-xs text-brand">Utama</span>}
            </span>
            <span className="text-ink-muted">{a.phone}</span>
            <span>{a.address}</span>
            {a.lat == null && <span className="text-xs text-warning">Tanpa titik lokasi: ongkir memakai tarif dasar.</span>}
          </div>
          <div className="flex flex-col gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>
              Ubah
            </Button>
            <Button size="sm" variant="ghost" className="hover:text-danger" isLoading={remove.isPending && remove.variables === a.id} onClick={() => remove.mutate(a.id)}>
              Hapus
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" className="mt-4 text-danger" onClick={logout}>
        <LogOut aria-hidden /> Keluar
      </Button>

      {editing && <AddressDialog key={editing === "new" ? "new" : editing.id} address={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AddressDialog({ address, onClose }: { address: Address | null; onClose: () => void }) {
  const [form, setForm] = useState<AddressInput>(
    address ?? { label: "Rumah", recipient: "", phone: "", address: "", notes: null, lat: null, lng: null, isDefault: false },
  );
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const save = useSaveAddress();
  const errors = save.error instanceof AppError ? save.error.fieldErrors : {};
  const set = <K extends keyof AddressInput>(k: K, v: AddressInput[K]) => {
    if (save.error) save.reset();
    setForm((f) => ({ ...f, [k]: v }));
  };

  // Titik lokasi dipakai untuk ongkir per jarak & estimasi tiba.
  const locate = () => {
    if (!navigator.geolocation) return setLocError("Browser tidak mendukung lokasi.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLocError(null);
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
      },
      () => {
        setLocating(false);
        setLocError("Lokasi tidak bisa diambil. Izinkan akses lokasi di browser.");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={address ? "Ubah alamat" : "Alamat baru"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button isLoading={save.isPending} onClick={() => save.mutate({ id: address?.id ?? null, input: form }, { onSuccess: onClose })}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Label" error={errors.label}>
            <Input value={form.label} maxLength={50} onChange={(e) => set("label", e.target.value)} placeholder="Rumah / Kantor" />
          </Field>
          <Field label="Penerima" error={errors.recipient}>
            <Input value={form.recipient} maxLength={100} onChange={(e) => set("recipient", e.target.value)} />
          </Field>
        </div>
        <Field label="Nomor HP" error={errors.phone}>
          <Input inputMode="tel" value={form.phone} maxLength={20} onChange={(e) => set("phone", e.target.value)} placeholder="081234567890" />
        </Field>
        <Field label="Alamat lengkap" error={errors.address}>
          <Textarea value={form.address} maxLength={500} onChange={(e) => set("address", e.target.value)} placeholder="Jalan, nomor, RT/RW, kelurahan" />
        </Field>
        <Field label="Catatan untuk kurir (opsional)" error={errors.notes}>
          <Input value={form.notes ?? ""} maxLength={500} onChange={(e) => set("notes", e.target.value)} placeholder="Pagar hitam, sebelah warung" />
        </Field>
        <div className="flex items-center justify-between gap-3 rounded-panel bg-surface-muted p-3 text-sm">
          <span>{form.lat != null ? `📍 Titik lokasi tersimpan (${form.lat.toFixed(4)}, ${form.lng?.toFixed(4)})` : "Belum ada titik lokasi"}</span>
          <Button size="sm" variant="outline" isLoading={locating} onClick={locate}>
            Pakai lokasi saat ini
          </Button>
        </div>
        {locError && <p className="text-xs text-danger">{locError}</p>}
        <Switch label="Jadikan alamat utama" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} />
        {save.error instanceof AppError && Object.keys(errors).length === 0 && <p className="text-sm text-danger">{save.error.message}</p>}
      </div>
    </Dialog>
  );
}
