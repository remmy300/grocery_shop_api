import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getApiBaseUrl } from "@/lib/api";

const API_BASE_URL = getApiBaseUrl();

interface InitiatePaymentPayload {
  orderId: number;
  phoneNumber: string;
  amount: number;
}

interface PaymentResponse {
  message: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  customerMessage: string;
  payment: {
    id: number;
    status: string;
  };
}

interface PaymentStatus {
  payment: {
    id: number;
    status: "pending" | "completed" | "failed";
    mpesaReceiptNumber: string | null;
    resultCode: string | null;
    resultDescription: string | null;
  };
  status: string;
}

/**
  Hook for handling M-Pesa payment flow
 */
export function useMpesaPayment() {
  const [pollInterval, setPollInterval] = useState<number | false>(false);

  // Initiate payment
  const initiateMutation = useMutation({
    mutationFn: async (payload: InitiatePaymentPayload) => {
      const res = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to initiate payment");
      }

      return (await res.json()) as PaymentResponse;
    },
  });

  // Query payment status
  const statusQuery = useQuery({
    queryKey: ["paymentStatus", pollInterval],
    queryFn: async () => {
      if (!initiateMutation.data?.payment.id) {
        throw new Error("No payment ID available");
      }

      const res = await fetch(
        `${API_BASE_URL}/api/payments/status?orderId=${initiateMutation.data.payment.id}`,
      );

      if (!res.ok) throw new Error("Failed to fetch payment status");
      return (await res.json()) as PaymentStatus;
    },
    enabled: !!pollInterval && !!initiateMutation.data,
    refetchInterval: pollInterval || false,
    refetchOnWindowFocus: false,
  });

  return {
    initiate: initiateMutation,
    status: statusQuery,
    isPaymentCompleted: statusQuery.data?.payment.status === "completed",
    isPaymentFailed: statusQuery.data?.payment.status === "failed",
    startPolling: (interval: number = 3000) => setPollInterval(interval),
    stopPolling: () => setPollInterval(false),
  };
}

/**
 * Hook to get payment details for an order
 */
export function usePaymentDetails(orderId: number | null) {
  return useQuery({
    queryKey: ["paymentDetails", orderId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/payments/${orderId}`, {
        headers: {
          Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch payment details");
      return await res.json();
    },
    enabled: !!orderId,
  });
}
