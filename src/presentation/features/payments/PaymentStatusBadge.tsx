import { PAYMENT_STATUS_LABEL, REFUND_STATUS_LABEL, type PaymentStatus, type RefundStatus } from "@/domain/payment/Payment";
import { Badge, type BadgeProps } from "../../components/ui";

const TONE: Record<PaymentStatus, NonNullable<BadgeProps["tone"]>> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  EXPIRED: "neutral",
  CANCELLED: "neutral",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge tone={TONE[status]} dot>
      {PAYMENT_STATUS_LABEL[status]}
    </Badge>
  );
}

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  return <Badge tone={status === "REQUIRED" || status === "REVERSED" ? "danger" : "info"}>{REFUND_STATUS_LABEL[status]}</Badge>;
}
