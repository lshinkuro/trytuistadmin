import type { Metadata } from "next";
import { DealsView } from "@/presentation/features/deals/DealsView";

export const metadata: Metadata = { title: "Promo" };

export default function PromosPage() {
  return <DealsView />;
}
