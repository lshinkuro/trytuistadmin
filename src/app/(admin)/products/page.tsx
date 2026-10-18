import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsView } from "@/presentation/features/products/ProductsView";

export const metadata: Metadata = { title: "Produk & harga" };

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsView />
    </Suspense>
  );
}
