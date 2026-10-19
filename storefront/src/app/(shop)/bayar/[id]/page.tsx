import type { Metadata } from "next";
import { PaymentView } from "@/presentation/features/cart/PaymentView";

export const metadata: Metadata = { title: "Pembayaran" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentView id={id} />;
}
