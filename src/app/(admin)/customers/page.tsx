import type { Metadata } from "next";
import { UsersView } from "@/presentation/features/users/UsersView";

export const metadata: Metadata = { title: "Pelanggan" };

export default function CustomersPage() {
  return <UsersView />;
}
