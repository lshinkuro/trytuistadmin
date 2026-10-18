"use client";

import { Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Product, ProductFilter } from "@/domain/product/Product";
import { formatNumber, formatRupiah } from "@/shared/lib/format";
import { EmptyState, ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Badge, Button, Card, Input, Select, Skeleton, Switch, Table, TBody, TD, TH, THead, TR } from "../../components/ui";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useCategories, useProducts, useUpdateProduct } from "../../hooks/useProducts";
import { useSetStoreStock, useStores } from "../../hooks/useStores";
import { StoreSelect } from "../stores/StoreSelect";
import { ProductFormDialog } from "./ProductFormDialog";

export function ProductsView() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState<ProductFilter["availability"]>("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  // ?store= dari halaman Outlet ("Menu habis").
  const [storeId, setStoreId] = useState(useSearchParams().get("store") ?? "");
  const filter: ProductFilter = { query: useDebouncedValue(query), categoryId, availability, storeId };
  const products = useProducts(filter);
  const categories = useCategories();
  const update = useUpdateProduct();
  const storeStock = useSetStoreStock();
  const storeName = useStores().data?.find((s) => s.id === storeId)?.name;

  return (
    <>
      <PageHeader
        title="Produk & harga"
        description="Tambah menu, ubah harga (sama di semua outlet), varian, dan stok. Pilih outlet untuk menandai menu habis di outlet itu saja."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden /> Tambah menu
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <StoreSelect value={storeId} onChange={setStoreId} allLabel="Stok pusat (semua outlet)" />
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Cari produk</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau kode produk" className="pl-9" />
        </label>
        <Select aria-label="Kategori" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-48">
          <option value="">Semua kategori</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Stok"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as ProductFilter["availability"])}
          className="w-40"
        >
          <option value="all">Semua stok</option>
          <option value="available">Tersedia</option>
          <option value="unavailable">Habis</option>
        </Select>
      </div>

      {products.isError ? (
        <ErrorState error={products.error} onRetry={() => products.refetch()} />
      ) : (
        <Card>
          <Table>
            <THead>
              <TR>
                <TH>Produk</TH>
                <TH className="text-right">Harga normal</TH>
                <TH className="text-right">Dibayar pelanggan</TH>
                <TH className="text-right">Terjual</TH>
                <TH>{storeName ? `Stok di ${storeName}` : "Stok (semua outlet)"}</TH>
                <TH>
                  <span className="sr-only">Aksi</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {products.isPending &&
                Array.from({ length: 6 }, (_, i) => (
                  <TR key={i}>
                    <TD colSpan={6}>
                      <Skeleton className="h-10 w-full" />
                    </TD>
                  </TR>
                ))}
              {products.data?.map((p) => (
                <TR key={p.id} className={p.isAvailable ? undefined : "bg-surface-muted"}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="size-11 shrink-0 rounded-control object-cover" loading="lazy" />
                      ) : (
                        <span className="size-11 shrink-0 rounded-control bg-neutral-soft" />
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-xs text-ink-muted">
                          {p.categoryName} · {p.id}
                          {p.options.length > 0 && ` · ${p.options.length} varian`}
                        </span>
                      </div>
                    </div>
                  </TD>
                  <TD className="tabular text-right">{formatRupiah(p.price)}</TD>
                  <TD className="tabular text-right">
                    {p.dealPrice !== null ? (
                      <span className="inline-flex items-center gap-2">
                        <Badge tone="brand">Promo</Badge>
                        <span className="font-semibold">{formatRupiah(p.effectivePrice)}</span>
                      </span>
                    ) : (
                      <span className="text-ink-muted">sama</span>
                    )}
                  </TD>
                  <TD className="tabular text-right text-ink-muted">{formatNumber(p.soldCount)}</TD>
                  <TD>
                    {storeId && p.store ? (
                      p.isAvailable ? (
                        <Switch
                          label={p.store.isAvailable ? "Tersedia" : "Habis di outlet ini"}
                          checked={p.store.isAvailable}
                          disabled={storeStock.isPending && storeStock.variables?.productId === p.id}
                          onChange={(e) => storeStock.mutate({ storeId, productId: p.id, isAvailable: e.target.checked })}
                          aria-label={`Stok ${p.name} di ${storeName ?? storeId}`}
                        />
                      ) : (
                        <span className="text-sm text-ink-muted">Habis di semua outlet</span>
                      )
                    ) : (
                      <Switch
                        label={p.isAvailable ? "Tersedia" : "Habis"}
                        checked={p.isAvailable}
                        disabled={update.isPending && update.variables?.id === p.id}
                        onChange={(e) => update.mutate({ id: p.id, isAvailable: e.target.checked })}
                        aria-label={`Stok ${p.name} di semua outlet`}
                      />
                    )}
                  </TD>
                  <TD className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                      Ubah
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {products.data?.length === 0 &&
            (filter.query || categoryId || availability !== "all" || storeId ? (
              <EmptyState title="Produk tidak ditemukan" description="Coba kata kunci atau filter lain." />
            ) : (
              <EmptyState
                title="Belum ada menu"
                description="Tambahkan menu pertama supaya pelanggan bisa memesan."
                action={<Button onClick={() => setEditing("new")}>Tambah menu</Button>}
              />
            ))}
        </Card>
      )}
      {editing && (
        <ProductFormDialog
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
