"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { AdminRole } from "@/domain/auth/Auth";
import { AppError } from "@/domain/shared/errors";
import { MIN_PASSWORD, type Staff } from "@/domain/staff/Staff";
import { formatDateTime } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge, Button, Card, Dialog, Field, Input, Select, Skeleton, Table, TBody, TD, TH, THead, TR } from "../../components/ui";
import { useCurrentAdmin } from "../../hooks/useAuth";
import { useCreateStaff, useStaff, useUpdateStaff } from "../../hooks/useStaff";
import { StoreSelect } from "../stores/StoreSelect";

function CreateStaffDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("OUTLET_ADMIN");
  const [storeId, setStoreId] = useState("");
  const create = useCreateStaff();
  const errors = create.error instanceof AppError ? create.error.fieldErrors : {};

  return (
    <Dialog
      open
      onClose={onClose}
      title="Akun admin baru"
      description="Admin outlet login di web ini dengan email & password berikut, dan hanya bisa mengatur outletnya."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={() => create.mutate({ name, email, password, role, storeId }, { onSuccess: onClose })} isLoading={create.isPending}>
            Buat akun
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama" error={errors.name}>
          <Input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="Admin Kemang" />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kemang@trytuist.com" autoComplete="off" />
        </Field>
        <Field label="Password awal" error={errors.password} hint={`Minimal ${MIN_PASSWORD} karakter. Sampaikan ke pemilik akun secara pribadi.`}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </Field>
        <Field label="Peran" error={errors.role}>
          <Select value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
            <option value="OUTLET_ADMIN">Admin outlet</option>
            <option value="SUPER_ADMIN">Super admin (semua outlet)</option>
          </Select>
        </Field>
        {role === "OUTLET_ADMIN" && (
          <Field label="Outlet" error={errors.storeId} className="sm:col-span-2">
            <StoreSelect value={storeId} onChange={setStoreId} allLabel="Pilih outlet…" className="w-full" />
          </Field>
        )}
        {create.error instanceof AppError && Object.keys(errors).length === 0 && (
          <p role="alert" className="text-sm text-danger sm:col-span-2">
            {create.error.message}
          </p>
        )}
      </div>
    </Dialog>
  );
}

export function StaffView() {
  const staff = useStaff();
  const update = useUpdateStaff();
  const me = useCurrentAdmin().data;
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<Staff | null>(null);

  return (
    <>
      <PageHeader
        title="Akun admin"
        description="Super admin mengatur semua outlet, kategori, dan akun. Admin outlet hanya pesanan, menu, stok, harga, promo, dan jam buka outletnya."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden /> Tambah akun
          </Button>
        }
      />
      {staff.isError ? (
        <ErrorState error={staff.error} onRetry={() => staff.refetch()} />
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Akun</TH>
                <TH>Peran</TH>
                <TH>Outlet</TH>
                <TH>Dibuat</TH>
                <TH>
                  <span className="sr-only">Aksi</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {staff.isPending && (
                <TR>
                  <TD colSpan={5}>
                    <Skeleton className="h-24 w-full" />
                  </TD>
                </TR>
              )}
              {staff.data?.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <span className="font-semibold">{s.name}</span>
                    <span className="block text-xs text-ink-muted">{s.email}</span>
                  </TD>
                  <TD>
                    <Badge tone={s.role === "SUPER_ADMIN" ? "brand" : "info"}>{s.role === "SUPER_ADMIN" ? "Super admin" : "Admin outlet"}</Badge>
                  </TD>
                  <TD>
                    {s.role === "OUTLET_ADMIN" ? (
                      <StoreSelect
                        value={s.store?.id ?? ""}
                        allLabel="Pilih outlet…"
                        onChange={(storeId) => storeId && update.mutate({ id: s.id, input: { storeId } })}
                      />
                    ) : (
                      <span className="text-sm text-ink-muted">Semua outlet</span>
                    )}
                  </TD>
                  <TD className="tabular text-sm text-ink-muted">{formatDateTime(s.createdAt)}</TD>
                  <TD className="text-right">
                    {s.id !== me?.id && (
                      <Button size="sm" variant="ghost" className="hover:text-danger" onClick={() => setRevoking(s)}>
                        Cabut akses
                      </Button>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {staff.data?.length === 0 && <EmptyState title="Belum ada akun admin" />}
        </Card>
      )}
      {update.error instanceof AppError && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {update.error.message}
        </p>
      )}
      {creating && <CreateStaffDialog onClose={() => setCreating(false)} />}
      {revoking && (
        <Dialog
          open
          onClose={() => setRevoking(null)}
          title={`Cabut akses ${revoking.name}?`}
          description="Akun tetap ada sebagai pelanggan biasa, tapi tidak bisa membuka web admin lagi. Berlaku seketika."
          footer={
            <>
              <Button variant="ghost" onClick={() => setRevoking(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                isLoading={update.isPending}
                onClick={() => update.mutate({ id: revoking.id, input: { revoke: true } }, { onSuccess: () => setRevoking(null) })}
              >
                Cabut akses
              </Button>
            </>
          }
        >
          {null}
        </Dialog>
      )}
    </>
  );
}
