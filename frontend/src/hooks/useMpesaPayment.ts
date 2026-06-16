import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { getAccessToken } from "@/hooks/useCart";

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

// Maximum time to poll before giving up (5 minutes)
const MAX_POLL_MS = 5 * 60 * 1000;

export function useMpesaPayment() {
  const [pollInterval, setPollInterval] = useState<number | false>(false);
  const pollStartTime = useRef<number | null>(null);

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
        throw new Error(data?.message || `Payment initiation failed (${res.status})`);
      }

      return data as PaymentResponse;
    },
  });

  // Status query — reads from the DB only; callback is the source of truth.
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
    enabled: !!pollInterval && !!initiateMutation.data?.checkoutRequestId,
    refetchInterval: pollInterval || false,
    refetchOnWindowFocus: false,
  });

  // Stop polling after MAX_POLL_MS to avoid infinite polling when callback
  // never arrives (e.g. user ignored the STK prompt).
  useEffect(() => {
    if (!pollInterval) return;
    const timer = setTimeout(() => {
      setPollInterval(false);
    }, MAX_POLL_MS);
    return () => clearTimeout(timer);
  }, [pollInterval]);

  const startPolling = (interval = 3000) => {
    pollStartTime.current = Date.now();
    setPollInterval(interval);
  };

  const stopPolling = () => {
    setPollInterval(false);
    pollStartTime.current = null;
  };

  return {
    initiate: initiateMutation,
    status: statusQuery,
    isPolling: !!pollInterval,
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
