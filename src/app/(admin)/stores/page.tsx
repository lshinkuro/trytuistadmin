import type { Metadata } from "next";
import { StoresView } from "@/presentation/features/stores/StoresView";

export const metadata: Metadata = { title: "Outlet" };

export default function StoresPage() {
  return <StoresView />;
}
