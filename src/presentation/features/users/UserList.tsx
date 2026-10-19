import { isRepeatBuyer, type User } from "@/domain/user/User";
import { formatDate, formatNumber, formatRupiah } from "@/shared/lib/format";
import { Badge, Table, TBody, TD, TH, THead, TR } from "../../components/ui";

/**
 * Feature component "bodoh": hanya menerima data lewat props dan merangkai base component.
 * Tidak tahu data datang dari HTTP, mock, atau cache.
 */
export function UserList({ users }: { users: User[] }) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Pelanggan</TH>
          <TH>Member</TH>
          <TH className="text-right">Pesanan</TH>
          <TH className="text-right">Belanja sukses</TH>
          <TH>Pesanan terakhir</TH>
          <TH>Bergabung</TH>
        </TR>
      </THead>
      <TBody>
        {users.map((user) => (
          <TR key={user.id}>
            <TD>
              <div className="flex flex-col">
                <span className="flex items-center gap-2 font-semibold">
                  {user.name}
                  {user.role !== "CUSTOMER" && <Badge tone="info">Admin</Badge>}
                  {isRepeatBuyer(user) && <Badge tone="success">Langganan</Badge>}
                </span>
                <span className="text-xs text-ink-muted">
                  {user.email}
                  {user.phone ? ` · ${user.phone}` : ""}
                </span>
              </div>
            </TD>
            <TD className="text-ink-muted capitalize">{user.tier.toLowerCase()}</TD>
            <TD className="tabular text-right">{formatNumber(user.ordersCount)}</TD>
            <TD className="tabular text-right font-semibold">{formatRupiah(user.totalSpent)}</TD>
            <TD className="tabular text-ink-muted">{user.lastOrderAt ? formatDate(user.lastOrderAt) : "Belum pernah"}</TD>
            <TD className="tabular text-ink-muted">{formatDate(user.createdAt)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
