import type { Metadata } from "next";
import { OrdersView } from "@/presentation/features/orders/OrdersView";

export const metadata: Metadata = { title: "Pesanan" };

export default function Page() {
  return <OrdersView />;
}
