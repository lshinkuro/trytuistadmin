"use client";

import { useState } from "react";
import type { Store, StoreInput } from "@/domain/store/Store";
import { AppError } from "@/domain/shared/errors";
import {
  Button,
  Dialog,
  Field,
  Input,
  Switch,
  Textarea,
} from "../../components/ui";
import { useCurrentAdmin } from "../../hooks/useAuth";
import { useSaveStore } from "../../hooks/useStores";

interface FormState {
  name: string;
  address: string;
  lat: string;
  lng: string;
  phone: string;
  opensAt: string;
  closesAt: string;
  allDay: boolean;
  radius: string;
  isActive: boolean;
}

function initial(store: Store | null): FormState {
  const allDay = store ? store.opensAt === store.closesAt : false;
  return {
    name: store?.name ?? "",
    address: store?.address ?? "",
    lat: store ? String(store.lat) : "",
    lng: store ? String(store.lng) : "",
    phone: store?.phone ?? "",
    opensAt: allDay ? "08:00" : (store?.opensAt ?? "08:00"),
    closesAt: allDay ? "22:00" : (store?.closesAt ?? "22:00"),
    allDay,
    radius: store ? String(store.deliveryRadiusKm) : "5",
    isActive: store?.isActive ?? true,
  };
}

const num = (v: string) =>
  v.trim() === "" ? Number.NaN : Number(v.replace(",", "."));

/** `store` null = tambah outlet. */
export function StoreFormDialog({
  store,
  onClose,
}: {
  store: Store | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState(() => initial(store));
  // Admin outlet hanya mengatur jam buka, jangkauan & telepon (aturan backend §5.29).
  const limited = Boolean(useCurrentAdmin().data?.store);
  const save = useSaveStore();
  const errors = save.error instanceof AppError ? save.error.fieldErrors : {};
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (save.error) save.reset();
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = () => {
    const hours = {
      phone: form.phone,
      // Jam buka = jam tutup → 24 jam (aturan backend).
      opensAt: form.allDay ? "00:00" : form.opensAt,
      closesAt: form.allDay ? "00:00" : form.closesAt,
      deliveryRadiusKm: num(form.radius),
    };
    if (limited && store) {
      save.mutate({ id: store.id, input: hours }, { onSuccess: onClose });
      return;
    }
    const input: StoreInput = {
      name: form.name,
      address: form.address,
      lat: num(form.lat),
      lng: num(form.lng),
      phone: form.phone,
      // Jam buka = jam tutup → 24 jam (aturan backend).
      opensAt: form.allDay ? "00:00" : form.opensAt,
      closesAt: form.allDay ? "00:00" : form.closesAt,
      deliveryRadiusKm: num(form.radius),
      isActive: form.isActive,
      isTemporarilyClosed: store?.isTemporarilyClosed ?? false,
    };
    save.mutate({ id: store?.id, input }, { onSuccess: onClose });
  };

  const overnight = !form.allDay && form.closesAt < form.opensAt;

  return (
    <Dialog
      open
      onClose={onClose}
      title={store ? `Ubah ${store.name}` : "Tambah outlet"}
      description="Menu, stok & harga khusus outlet diatur di halaman Produk & harga."
      className="w-[min(40rem,calc(100vw-2rem))]"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} isLoading={save.isPending}>
            {store ? "Simpan outlet" : "Tambah outlet"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {!limited && (
          <>
            <Field
              label="Nama outlet"
              error={errors.name}
              className="sm:col-span-2"
            >
              <Input
                value={form.name}
                maxLength={80}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Tebet"
                autoFocus={!store}
              />
            </Field>
            <Field
              label="Alamat"
              error={errors.address}
              className="sm:col-span-2"
            >
              <Textarea
                value={form.address}
                maxLength={300}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Jl. Tebet Raya No. 5, Jakarta Selatan"
              />
            </Field>
            <Field
              label="Latitude"
              error={errors.lat}
              hint="Dari Google Maps: klik kanan titik outlet → salin koordinat."
            >
              <Input
                inputMode="decimal"
                className="tabular"
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                placeholder="-6.2264"
              />
            </Field>
            <Field label="Longitude" error={errors.lng}>
              <Input
                inputMode="decimal"
                className="tabular"
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                placeholder="106.8540"
              />
            </Field>
          </>
        )}
        <div className="flex flex-col gap-3 sm:col-span-2">
          <Switch
            label="Buka 24 jam"
            checked={form.allDay}
            onChange={(e) => set("allDay", e.target.checked)}
          />
          {!form.allDay && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jam buka (WIB)" error={errors.opensAt}>
                <Input
                  type="time"
                  value={form.opensAt}
                  onChange={(e) => set("opensAt", e.target.value)}
                />
              </Field>
              <Field
                label="Jam tutup (WIB)"
                error={errors.closesAt}
                hint={
                  overnight
                    ? "Tutup keesokan harinya (lewat tengah malam)."
                    : undefined
                }
              >
                <Input
                  type="time"
                  value={form.closesAt}
                  onChange={(e) => set("closesAt", e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
        <Field
          label="Jangkauan antar (km)"
          error={errors.deliveryRadiusKm}
          hint="Alamat di luar jarak ini tidak bisa pesan dari outlet ini."
        >
          <Input
            inputMode="decimal"
            className="tabular"
            value={form.radius}
            onChange={(e) => set("radius", e.target.value)}
          />
        </Field>
        <Field label="Telepon" error={errors.phone}>
          <Input
            type="tel"
            value={form.phone}
            maxLength={30}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="021-2900-1004"
          />
        </Field>
        {store && !limited && (
          <div className="sm:col-span-2">
            <Switch
              label="Outlet aktif (nonaktif = tidak tampil di aplikasi)"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
            />
          </div>
        )}
        {save.error instanceof AppError && Object.keys(errors).length === 0 && (
          <p role="alert" className="text-sm text-danger sm:col-span-2">
            {save.error.message}
          </p>
        )}
      </div>
    </Dialog>
  );
}
