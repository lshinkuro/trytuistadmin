import type { Metadata } from "next";
import { ActivityView } from "@/presentation/features/activity/ActivityView";

export const metadata: Metadata = { title: "Aktivitas" };

export default function ActivityPage() {
  return <ActivityView />;
}
