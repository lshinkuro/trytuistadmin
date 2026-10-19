"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaymentFilter, RefundInput } from "@/domain/payment/Payment";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

export function usePayments(filter: PaymentFilter) {
  const { listPayments } = useDependencies();
  return useQuery({
    queryKey: queryKeys.payments(filter),
    queryFn: () => listPayments(filter),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function usePayment(id: string) {
  const { getPayment } = useDependencies();
  return useQuery({ queryKey: queryKeys.payment(id), queryFn: () => getPayment(id) });
}

export function useRefundPayment() {
  const { refundPayment } = useDependencies();
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ input, refundable }: { input: RefundInput; refundable: number }) => refundPayment(input, refundable),
    onSuccess: (payment) => {
      client.setQueryData(queryKeys.payment(payment.id), payment);
      void client.invalidateQueries({ queryKey: ["payments", "list"] });
      void client.invalidateQueries({ queryKey: ["orders"] });
      void client.invalidateQueries({ queryKey: ["audit"] });
    },
    // Refund yang ditolak Midtrans tetap tercatat (FAILED) → muat ulang detail.
    onError: (_e, { input }) => void client.invalidateQueries({ queryKey: queryKeys.payment(input.paymentId) }),
  });
}
