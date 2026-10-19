import type { Metadata } from "next";
import { StaffView } from "@/presentation/features/staff/StaffView";

export const metadata: Metadata = { title: "Akun admin" };

export default function StaffPage() {
  return <StaffView />;
}
