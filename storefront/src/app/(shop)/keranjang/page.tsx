import type { Metadata } from "next";
import { CartView } from "@/presentation/features/cart/CartView";

export const metadata: Metadata = { title: "Keranjang" };

export default function Page() {
  return <CartView />;
}
