import type { OrderStatus } from "@/domain/order/Order";
import { ORDER_STATUS_LABEL } from "@/domain/order/orderStatus";
import { Badge, type BadgeProps } from "../../components/ui";

const TONE: Record<OrderStatus, NonNullable<BadgeProps["tone"]>> = {
  PENDING: "warning",
  PAID: "warning",
  PROCESSING: "warning",
  DELIVERING: "warning",
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
};

/** Warna + titik + teks: status tidak pernah hanya dibedakan warna. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={TONE[status]} dot>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}

export const PAYMENT_LABEL = { COD: "Bayar di tempat", QRIS: "QRIS", EWALLET: "E-wallet" } as const;
