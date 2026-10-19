import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsView } from "@/presentation/features/payments/PaymentsView";

export const metadata: Metadata = { title: "Pembayaran" };

export default function PaymentsPage() {
  return (
    <Suspense>
      <PaymentsView />
    </Suspense>
  );
}
