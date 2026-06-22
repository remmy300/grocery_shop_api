import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/hooks/useCart";

export interface MpesaPaymentError extends Error {
  retryable?: boolean;
  status?: number;
}

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

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 3 * 60 * 1000; // give up after 3 minutes

export function useMpesaPayment() {
  const [polling, setPolling] = useState(false);

  const initiateMutation = useMutation({
    mutationFn: async (payload: InitiatePaymentPayload) => {
      const API_BASE_URL = getApiBaseUrl();
      const token = getAccessToken();

      const res = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = new Error(
          data?.message ||
            (res.status === 503
              ? "M-Pesa is temporarily busy. Please wait a moment and try again."
              : `Payment initiation failed (${res.status})`),
        ) as Error & { retryable?: boolean; status?: number };
        err.retryable = !!data?.retryable;
        err.status = res.status;
        throw err;
      }

      return data as PaymentResponse;
    },
  });

  const statusQuery = useQuery({
    queryKey: ["paymentStatus", initiateMutation.data?.checkoutRequestId],
    queryFn: async () => {
      const checkoutRequestId = initiateMutation.data?.checkoutRequestId;
      if (!checkoutRequestId) throw new Error("No checkout request ID");

      const API_BASE_URL = getApiBaseUrl();
      const res = await fetch(
        `${API_BASE_URL}/api/payments/status?checkoutRequestId=${encodeURIComponent(checkoutRequestId)}`,
      );

      if (!res.ok) throw new Error("Failed to fetch payment status");

      return (await res.json()) as PaymentStatus;
    },
    // Stable number — avoids new function ref on every render resetting the interval
    enabled: polling && !!initiateMutation.data?.checkoutRequestId,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });

  // Stop polling when payment reaches a terminal state
  useEffect(() => {
    const status = statusQuery.data?.payment?.status;
    if (status === "completed" || status === "failed") {
      setPolling(false);
    }
  }, [statusQuery.data?.payment?.status]);

  // Stop polling after MAX_POLL_MS (user ignored the STK prompt)
  useEffect(() => {
    if (!polling) return;
    const timer = setTimeout(() => setPolling(false), MAX_POLL_MS);
    return () => clearTimeout(timer);
  }, [polling]);

  const startPolling = () => setPolling(true);
  const stopPolling = () => setPolling(false);

  return {
    initiate: initiateMutation,
    status: statusQuery,
    isPolling: polling,
    isPaymentCompleted: statusQuery.data?.payment.status === "completed",
    isPaymentFailed: statusQuery.data?.payment.status === "failed",
    startPolling,
    stopPolling,
  };
}

export function usePaymentDetails(orderId: number | null) {
  return useQuery({
    queryKey: ["paymentDetails", orderId],
    queryFn: async () => {
      const API_BASE_URL = getApiBaseUrl();
      const token = getAccessToken();

      const res = await fetch(`${API_BASE_URL}/api/payments/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch payment details");

      return res.json();
    },
    enabled: !!orderId,
  });
}
