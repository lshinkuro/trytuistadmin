"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { pageCount } from "@/domain/shared/pagination";
import { EmptyState, ErrorState, Pagination } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, Input, Skeleton } from "../../components/ui";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useUsers } from "../../hooks/useUsers";
import { UserList } from "./UserList";

export function UsersView() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(query);
  const users = useUsers({ query: debounced, page, limit: 20 });

  return (
    <>
      <PageHeader title="Pelanggan" description="Akun aplikasi beserta jumlah pesanan dan total belanja yang sukses." />
      <label className="relative mb-4 block max-w-md">
        <span className="sr-only">Cari pelanggan</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama, email, atau nomor HP"
          className="pl-9"
        />
      </label>
      {users.isError ? (
        <ErrorState error={users.error} onRetry={() => users.refetch()} />
      ) : (
        <Card>
          {users.isPending ? <Skeleton className="m-4 h-48" /> : <UserList users={users.data.items} />}
          {users.data?.items.length === 0 && <EmptyState title="Pelanggan tidak ditemukan" />}
          {users.data && <Pagination page={users.data.page} pageCount={pageCount(users.data)} onChange={setPage} />}
        </Card>
      )}
    </>
  );
}
