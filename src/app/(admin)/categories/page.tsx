import type { Metadata } from "next";
import { CategoriesView } from "@/presentation/features/categories/CategoriesView";

export const metadata: Metadata = { title: "Kategori" };

export default function CategoriesPage() {
  return <CategoriesView />;
}
