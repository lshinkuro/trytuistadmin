import type { Metadata } from "next";
import { OrderDetailView } from "@/presentation/features/orders/OrderDetailView";

export const metadata: Metadata = { title: "Detail pesanan" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailView id={id} />;
}
