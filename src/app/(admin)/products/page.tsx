import type { Metadata } from "next";
import { ProductsView } from "@/presentation/features/products/ProductsView";

export const metadata: Metadata = { title: "Produk & harga" };

export default function ProductsPage() {
  return <ProductsView />;
}
