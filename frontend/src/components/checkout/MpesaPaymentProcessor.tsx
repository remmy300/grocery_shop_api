"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useMpesaPayment, MpesaPaymentError } from "@/hooks/useMpesaPayment";
import { AlertCircle, CheckCircle2, Loader } from "lucide-react";

interface MpesaPaymentProcessorProps {
  orderId: number;
  amount: number;
  phoneNumber: string;
  customerName: string;
  onSuccess?: (receipt: string) => void;
  onError?: (error: string) => void;
}

export default function MpesaPaymentProcessor({
  orderId,
  amount,
  phoneNumber,
  onSuccess,
  onError,
}: MpesaPaymentProcessorProps) {
  const [inputPhone, setInputPhone] = useState(phoneNumber);

  const {
    initiate,
    status,
    isPolling,
    isPaymentCompleted,
    isPaymentFailed,
    startPolling,
    stopPolling,
  } = useMpesaPayment();

  useEffect(() => {
    if (isPaymentCompleted) {
      stopPolling();
      onSuccess?.(
        status.data?.payment.mpesaReceiptNumber || "PAYMENT_COMPLETED",
      );
    }
  }, [isPaymentCompleted, stopPolling, onSuccess, status.data]);

  useEffect(() => {
    if (isPaymentFailed) {
      stopPolling();
      onError?.(status.data?.payment.resultDescription || "Payment failed");
    }
  }, [isPaymentFailed, stopPolling, onError, status.data]);

  const handleInitiatePayment = () => {
    initiate.mutate(
      { orderId, phoneNumber: inputPhone, amount },
      {
        onSuccess: () => startPolling(),
        onError: (err) => onError?.(err.message),
      },
    );
  };

  return (
    <div className="space-y-4">
      {/* Initiation in progress */}
      {initiate.isPending && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Loader className="h-4 w-4 animate-spin" />
            <p className="text-sm">Sending M-Pesa prompt to your phone…</p>
          </CardContent>
        </Card>
      )}

      {/* Initiation error */}
      {initiate.isError &&
        (() => {
          const err = initiate.error as MpesaPaymentError;
          const isRetryable = err?.retryable;
          return (
            <Card
              className={
                isRetryable
                  ? "border-yellow-300 bg-yellow-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle
                  className={`h-4 w-4 ${isRetryable ? "text-yellow-600" : "text-red-600"}`}
                />
                <div>
                  <p
                    className={`text-sm font-medium ${isRetryable ? "text-yellow-900" : "text-red-900"}`}
                  >
                    {isRetryable ? "M-Pesa Busy" : "Payment Error"}
                  </p>
                  <p
                    className={`text-xs ${isRetryable ? "text-yellow-700" : "text-red-700"}`}
                  >
                    {err?.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })()}

      {/* Waiting for user to enter PIN — only shown once polling starts */}
      {isPolling && !isPaymentCompleted && !isPaymentFailed && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Loader className="h-4 w-4 animate-spin" />
            <div>
              <p className="text-sm font-medium">
                Waiting for payment confirmation…
              </p>
              <p className="text-xs text-muted-foreground">
                Enter your M-Pesa PIN on your phone to complete the payment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {isPaymentCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Payment Successful!
              </p>
              <p className="text-xs text-green-700">
                Receipt: {status.data?.payment.mpesaReceiptNumber}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failure */}
      {isPaymentFailed && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">Payment Failed</p>
              <p className="text-xs text-red-700">
                {status.data?.payment.resultDescription}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone input + pay button — hidden once STK push is sent */}
      {!initiate.data && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">M-Pesa Phone Number</label>
            <Input
              type="tel"
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              disabled={initiate.isPending}
              className="mt-1"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-900">
              <strong>Order Total:</strong> KES {amount.toFixed(2)}
            </p>
            <p className="text-xs text-blue-900 mt-1">
              You will receive an M-Pesa prompt on your phone. Enter your M-Pesa
              PIN to complete the payment.
            </p>
          </div>

          <Button
            onClick={handleInitiatePayment}
            disabled={initiate.isPending || !inputPhone.trim()}
            className="w-full h-11 font-semibold"
          >
            {initiate.isPending ? "Processing…" : "Send M-Pesa Prompt"}
          </Button>
        </div>
      )}

      {/* Completion state */}
      {isPaymentCompleted && (
        <Button className="w-full h-11 font-semibold" disabled>
          Payment Complete
        </Button>
      )}

      {/* Retry on failure */}
      {isPaymentFailed && (
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="w-full h-11 font-semibold"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
