import type { Metadata } from "next";
import { ProductView } from "@/presentation/features/catalog/ProductView";

export const metadata: Metadata = { title: "Menu" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductView id={id} />;
}
