import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useMpesaPayment } from "@/hooks/useMpesaPayment";
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
  customerName,
  onSuccess,
  onError,
}: MpesaPaymentProcessorProps) {
  const [inputPhone, setInputPhone] = useState(phoneNumber);
  const {
    initiate,
    status,
    isPaymentCompleted,
    isPaymentFailed,
    startPolling,
    stopPolling,
  } = useMpesaPayment();

  // Handle payment completion
  useEffect(() => {
    if (isPaymentCompleted) {
      stopPolling();
      const receipt =
        status.data?.payment.mpesaReceiptNumber || "PAYMENT_COMPLETED";
      onSuccess?.(receipt);
    }
  }, [isPaymentCompleted, status.data]);

  // Handle payment failure
  useEffect(() => {
    if (isPaymentFailed) {
      stopPolling();
      const error = status.data?.payment.resultDescription || "Payment failed";
      onError?.(error);
    }
  }, [isPaymentFailed, status.data]);

  const handleInitiatePayment = async () => {
    if (!inputPhone.trim()) {
      onError?.("Please enter a valid phone number");
      return;
    }

    try {
      await initiate.mutateAsync({
        orderId,
        phoneNumber: inputPhone,
        amount,
      });

      // Start polling for payment status
      startPolling(3000); // Poll every 3 seconds
    } catch (error: any) {
      onError?.(error.message || "Failed to initiate payment");
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Status */}
      {initiate.isPending && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Loader className="h-4 w-4 animate-spin" />
            <p className="text-sm">Initiating M-Pesa payment...</p>
          </CardContent>
        </Card>
      )}

      {initiate.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">Payment Error</p>
              <p className="text-xs text-red-700">{initiate.error?.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status.isPending && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Loader className="h-4 w-4 animate-spin" />
            <p className="text-sm">Waiting for payment confirmation...</p>
          </CardContent>
        </Card>
      )}

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

      {/* Phone Input */}
      {!initiate.data && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">M-Pesa Phone Number</label>
            <Input
              type="tel"
              placeholder="254XXXXXXXXX or 0XXXXXXXXX"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              disabled={initiate.isPending}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: 254XXXXXXXXX (international) or 0XXXXXXXXX (local)
            </p>
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
            {initiate.isPending ? "Processing..." : "Send M-Pesa Prompt"}
          </Button>
        </div>
      )}

      {/* Completion Actions */}
      {isPaymentCompleted && (
        <div>
          <Button className="w-full h-11 font-semibold" disabled>
            ✓ Payment Complete
          </Button>
        </div>
      )}

      {isPaymentFailed && (
        <div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full h-11 font-semibold"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
