import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getApiBaseUrl } from "@/lib/api";

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

  console.log("HOOK RENDERED");

  // Initiate payment
  const initiateMutation = useMutation({
    mutationFn: async (payload: InitiatePaymentPayload) => {
      console.log("MUTATION FUNCTION ENTERED");
      console.log(payload);
      try {
        // Evaluate API_BASE_URL at runtime, not at module load time
        const API_BASE_URL = getApiBaseUrl();
        const paymentUrl = `${API_BASE_URL}/api/payments/initiate`;

        console.log(" Initiating M-Pesa payment to:", paymentUrl);
        console.log(" Payload:", payload);

        console.log("API_BASE_URL =", API_BASE_URL);
        console.log("paymentUrl =", paymentUrl);

        const res = await fetch(paymentUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log(" Response status:", res.status, res.statusText);

        // Clone response to read body safely
        const responseText = await res.text();
        console.log(" Response body:", responseText);

        let responseData: any;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (!res.ok) {
          console.error(" Payment initiation failed:", responseData);
          throw new Error(
            responseData?.message ||
              `Payment initiation failed: ${res.statusText}`,
          );
        }

        console.log(" Payment initiated successfully:", responseData);
        return responseData as PaymentResponse;
      } catch (error) {
        console.error(" M-Pesa mutation error:", error);
        throw error;
      }
    },
  });

  // Query payment status
  const statusQuery = useQuery({
    queryKey: ["paymentStatus", initiateMutation.data?.payment.id],
    queryFn: async () => {
      if (!initiateMutation.data?.payment.id) {
        throw new Error("No payment ID available");
      }

      const API_BASE_URL = getApiBaseUrl();
      const statusUrl = `${API_BASE_URL}/api/payments/status?orderId=${initiateMutation.data.payment.id}`;

      console.log(" Querying payment status from:", statusUrl);

      const res = await fetch(statusUrl);

      if (!res.ok) throw new Error("Failed to fetch payment status");

      const data = await res.json();
      console.log("Payment status received:", data);

      return data as PaymentStatus;
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
      const API_BASE_URL = getApiBaseUrl();
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : "";

      console.log(" Fetching payment details for order:", orderId);

      const res = await fetch(`${API_BASE_URL}/api/payments/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.text();
        console.error(" Failed to fetch payment details:", error);
        throw new Error("Failed to fetch payment details");
      }

      const data = await res.json();
      console.log(" Payment details:", data);
      return data;
    },
    enabled: !!orderId,
  });
}
