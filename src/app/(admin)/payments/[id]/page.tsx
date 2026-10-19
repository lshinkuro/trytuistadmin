import type { Metadata } from "next";
import { PaymentDetailView } from "@/presentation/features/payments/PaymentDetailView";

export const metadata: Metadata = { title: "Detail pembayaran" };

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentDetailView id={id} />;
}
