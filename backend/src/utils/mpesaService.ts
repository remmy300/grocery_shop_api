import axios from "axios";

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
      console.error("[mpesa] Failed to get access token:", error.response?.status);
      throw new Error(
        error.response?.data?.errorMessage || "Failed to authenticate with M-Pesa",
      );
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

    // Temporary diagnostics — remove once STK push is confirmed working
    console.log("[mpesa-debug] shortCode:", this.config.shortCode);
    console.log("[mpesa-debug] timestamp:", timestamp);
    console.log("[mpesa-debug] passkey first 8 chars:", this.config.passkey?.slice(0, 8));
    console.log("[mpesa-debug] password first 8 chars:", password?.slice(0, 8));
    console.log("[mpesa-debug] raw concat prefix (shortCode+passkey[0..7]+timestamp):",
      `${this.config.shortCode}${this.config.passkey?.slice(0, 8)}...${timestamp}`);

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
      const response = await axios.post<STKPushResponse>(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
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
      const response = await axios.post(
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
        body.Body?.stkCallback?.CheckoutRequestID ?? body.checkoutRequestId ?? null,
      merchantRequestId:
        body.Body?.stkCallback?.MerchantRequestID ?? body.merchantRequestId ?? null,
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
    // Safaricom requires EAT (UTC+3). toLocaleString with timeZone is unreliable
    // on Windows Node builds that ship without full ICU data, so we add the offset manually.
    const eat = new Date(Date.now() + 3 * 60 * 60 * 1000);
    return [
      eat.getUTCFullYear(),
      String(eat.getUTCMonth() + 1).padStart(2, "0"),
      String(eat.getUTCDate()).padStart(2, "0"),
      String(eat.getUTCHours()).padStart(2, "0"),
      String(eat.getUTCMinutes()).padStart(2, "0"),
      String(eat.getUTCSeconds()).padStart(2, "0"),
    ].join("");
  }

  private generatePassword(timestamp: string): string {
    return Buffer.from(
      `${this.config.shortCode}${this.config.passkey}${timestamp}`,
    ).toString("base64");
  }
}

export default MpesaService;
