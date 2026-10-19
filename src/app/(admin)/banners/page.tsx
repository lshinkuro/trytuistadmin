import type { Metadata } from "next";
import { BannersView } from "@/presentation/features/banners/BannersView";

export const metadata: Metadata = { title: "Banner" };

export default function BannersPage() {
  return <BannersView />;
}
