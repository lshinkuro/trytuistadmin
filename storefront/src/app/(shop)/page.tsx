import type { Metadata } from "next";
import { HomeView } from "@/presentation/features/catalog/HomeView";

export const metadata: Metadata = { title: "Beranda" };

export default function Page() {
  return <HomeView />;
}
