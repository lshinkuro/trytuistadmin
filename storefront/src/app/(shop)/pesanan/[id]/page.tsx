import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetailView } from "@/presentation/features/orders/OrderDetailView";

export const metadata: Metadata = { title: "Detail pesanan" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <OrderDetailView id={id} />
    </Suspense>
  );
}
