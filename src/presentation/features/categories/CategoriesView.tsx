"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { AdminCategory } from "@/domain/category/Category";
import { AppError } from "@/domain/shared/errors";
import { formatNumber } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Button, Card, Dialog, Field, Input, Skeleton, Switch, Table, TBody, TD, TH, THead, TR } from "../../components/ui";
import { useAdminCategories, useSaveCategory } from "../../hooks/useAdminCategories";

function CategoryFormDialog({ category, onClose }: { category: AdminCategory | null; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? ""));
  const save = useSaveCategory();
  const errors = save.error instanceof AppError ? save.error.fieldErrors : {};
  const submit = () =>
    save.mutate(
      {
        id: category?.id,
        input: { name, icon: icon.trim(), ...(sortOrder !== "" ? { sortOrder: Number(sortOrder) } : {}) },
      },
      { onSuccess: onClose },
    );

  return (
    <Dialog
      open
      onClose={onClose}
      title={category ? `Ubah ${category.name}` : "Kategori baru"}
      description={category ? `Kode ${category.id}` : "Kode kategori dibuat dari nama, mis. “Kue & Roti” → kue-roti."}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} isLoading={save.isPending}>
            {category ? "Simpan" : "Tambah kategori"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem_6rem]">
        <Field label="Nama" error={errors.name}>
          <Input value={name} maxLength={50} onChange={(e) => setName(e.target.value)} placeholder="Kue & Roti" />
        </Field>
        <Field label="Ikon" error={errors.icon} hint="Emoji">
          <Input value={icon} maxLength={16} onChange={(e) => setIcon(e.target.value)} placeholder="🥐" />
        </Field>
        <Field label="Urutan" error={errors.sortOrder}>
          <Input inputMode="numeric" className="tabular" value={sortOrder} onChange={(e) => setSortOrder(e.target.value.replace(/\D/g, ""))} />
        </Field>
        {save.error instanceof AppError && Object.keys(errors).length === 0 && (
          <p role="alert" className="text-sm text-danger sm:col-span-3">
            {save.error.message}
          </p>
        )}
      </div>
    </Dialog>
  );
}

export function CategoriesView() {
  const categories = useAdminCategories();
  const save = useSaveCategory();
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);

  return (
    <>
      <PageHeader
        title="Kategori"
        description="Kategori menu di aplikasi. Kategori yang disembunyikan beserta menunya tidak tampil untuk pelanggan."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden /> Tambah kategori
          </Button>
        }
      />
      {categories.isError ? (
        <ErrorState error={categories.error} onRetry={() => categories.refetch()} />
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Kategori</TH>
                <TH className="text-right">Menu</TH>
                <TH className="text-right">Urutan</TH>
                <TH>Tampil di aplikasi</TH>
                <TH>
                  <span className="sr-only">Aksi</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {categories.isPending && (
                <TR>
                  <TD colSpan={5}>
                    <Skeleton className="h-24 w-full" />
                  </TD>
                </TR>
              )}
              {categories.data?.map((c) => (
                <TR key={c.id} className={c.isActive ? undefined : "bg-surface-muted"}>
                  <TD>
                    <span className="font-semibold">
                      {c.icon} {c.name}
                    </span>
                    <span className="block text-xs text-ink-muted">{c.id}</span>
                  </TD>
                  <TD className="tabular text-right">{formatNumber(c.productCount)}</TD>
                  <TD className="tabular text-right text-ink-muted">{c.sortOrder}</TD>
                  <TD>
                    <Switch
                      label={c.isActive ? "Tampil" : "Disembunyikan"}
                      checked={c.isActive}
                      disabled={save.isPending && save.variables?.id === c.id}
                      onChange={(e) => save.mutate({ id: c.id, input: { isActive: e.target.checked } })}
                      aria-label={`Tampilkan kategori ${c.name}`}
                    />
                  </TD>
                  <TD className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                      Ubah
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {categories.data?.length === 0 && <EmptyState title="Belum ada kategori" />}
        </Card>
      )}
      {editing && (
        <CategoryFormDialog key={editing === "new" ? "new" : editing.id} category={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
