import axios from "axios";

// Retry a Safaricom API call on transient errors (503, 429, network timeout).
// surfaces as a 500 to the end user.
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;
      const safaricomCode: string = error.response?.data?.errorCode ?? "";

      const isTransient =
        !status ||
        status === 503 ||
        status === 429 ||
        safaricomCode.startsWith("500.003");

      if (!isTransient || attempt === maxAttempts) throw error;

      const delay = baseDelayMs * 2 ** (attempt - 1);
      console.warn(
        `[mpesa] attempt ${attempt} transient error (HTTP ${status ?? "none"} errorCode ${safaricomCode || "n/a"}), retrying in ${delay}ms`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: "sandbox" | "production";
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;

  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: MpesaConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === "sandbox"
        ? "https://sandbox.safaricom.co.ke"
        : "https://api.safaricom.co.ke";
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const credentials = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`,
    ).toString("base64");

    try {
      const response = await axios.get<AccessTokenResponse>(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${credentials}` } },
      );

      this.accessToken = response.data.access_token;
      // Expire 1 minute early for safety
      this.tokenExpiry =
        Date.now() + (Number(response.data.expires_in) - 60) * 1000;

      return this.accessToken;
    } catch (error: any) {
      console.error(
        "[mpesa] Failed to get access token:",
        error.response?.status,
        error.response?.data,
      );
      throw error;
    }
  }

  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    orderId: number,
  ): Promise<STKPushResponse> {
    if (!amount || amount < 1) {
      throw new Error("Amount must be greater than zero");
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: this.config.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: this.config.callbackUrl,
      AccountReference: `ORDER-${orderId}`,
      TransactionDesc: `Payment for order ${orderId}`,
    };

    try {
      const response = await withRetry(() =>
        axios.post<STKPushResponse>(
          `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      console.error("[mpesa] STK push failed:", {
        status: error.response?.status,
        code: error.response?.data?.errorCode,
        message: error.response?.data?.errorMessage,
      });
      throw error;
    }
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<{
    ResultCode: string;
    ResultDescription: string;
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
  }> {
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    try {
      const response = await withRetry(() =>
        axios.post(
          `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
          {
            BusinessShortCode: this.config.shortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      console.error("[mpesa] STK query failed:", {
        status: error.response?.status,
        code: error.response?.data?.errorCode,
      });
      throw error;
    }
  }

  parseCallbackResponse(body: any): {
    resultCode: string;
    resultDescription: string;
    mpesaReceiptNumber: string | null;
    amount: number | null;
    phoneNumber: string | null;
    checkoutRequestId: string | null;
    merchantRequestId: string | null;
  } {
    const result = body.Body?.stkCallback?.CallbackMetadata?.Item ?? [];

    const findItem = (name: string) =>
      result.find((item: any) => item.Name === name)?.Value ?? null;

    return {
      resultCode: body.Body?.stkCallback?.ResultCode?.toString() ?? "1",
      resultDescription:
        body.Body?.stkCallback?.ResultDesc ?? "Payment processing",
      mpesaReceiptNumber: findItem("MpesaReceiptNumber"),
      amount: findItem("Amount"),
      phoneNumber: findItem("PhoneNumber"),
      checkoutRequestId:
        body.Body?.stkCallback?.CheckoutRequestID ??
        body.checkoutRequestId ??
        null,
      merchantRequestId:
        body.Body?.stkCallback?.MerchantRequestID ??
        body.merchantRequestId ??
        null,
    };
  }

  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, "");

    let formatted: string;

    if (cleaned.startsWith("0") && cleaned.length === 10) {
      formatted = `254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith("254") && cleaned.length === 12) {
      formatted = cleaned;
    } else {
      throw new Error(
        `Invalid phone number. Expected 07XXXXXXXX or 2547XXXXXXXX, got: ${phoneNumber}`,
      );
    }

    return formatted;
  }

  private generateTimestamp(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private generatePassword(timestamp: string): string {
    return Buffer.from(
      `${this.config.shortCode}${this.config.passkey}${timestamp}`,
    ).toString("base64");
  }
}

export default MpesaService;
