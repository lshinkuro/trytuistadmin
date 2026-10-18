import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersView } from "@/presentation/features/orders/OrdersView";

export const metadata: Metadata = { title: "Pesanan" };

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersView />
    </Suspense>
  );
}
