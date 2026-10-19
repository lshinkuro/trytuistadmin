import type { Metadata } from "next";
import { DeliverySettingsView } from "@/presentation/features/delivery/DeliverySettingsView";

export const metadata: Metadata = { title: "Ongkir" };

export default function DeliveryPage() {
  return <DeliverySettingsView />;
}
