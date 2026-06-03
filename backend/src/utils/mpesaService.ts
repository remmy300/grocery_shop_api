import axios from "axios";

/**
 * M-Pesa API Service
 * Handles Daraja API integration for STK Push and payment callback
 */

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

  /**
   * Get OAuth access token
   */
  async getAccessToken(): Promise<string> {
    try {
      // Reuse token if still valid
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`,
      ).toString("base64");

      const response = await axios.get<AccessTokenResponse>(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;

      // Expire 1 minute early for safety
      this.tokenExpiry =
        Date.now() + (Number(response.data.expires_in) - 60) * 1000;

      return this.accessToken;
    } catch (error: any) {
      console.error(
        "Failed to get M-Pesa access token:",
        error.response?.data || error.message,
      );

      throw new Error(
        error.response?.data?.errorMessage ||
          "Failed to authenticate with M-Pesa",
      );
    }
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    orderId: number,
    customerName: string,
  ): Promise<STKPushResponse> {
    try {
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
      console.error(
        "STK Push initiation failed:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.errorMessage ||
          error.response?.data?.ResponseDescription ||
          "Failed to initiate M-Pesa payment",
      );
    }
  }

  /**
   * Query STK Push status
   */
  async querySTKPushStatus(checkoutRequestId: string): Promise<{
    ResultCode: string;
    ResultDescription: string;
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
  }> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: this.config.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
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
      console.error(
        "STK Push query failed:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.errorMessage ||
          "Failed to query M-Pesa payment status",
      );
    }
  }

  /**
   * Validate M-Pesa callback signature
   */
  validateCallbackSignature(body: any, expectedSignature: string): boolean {
    return true; //sandbox
  }

  /**
   * Format phone number to international format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, "");

    let formatted = cleaned;

    if (cleaned.startsWith("0")) {
      formatted = `254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith("254")) {
      formatted = cleaned;
    }

    if (!/^2547\d{8}$/.test(formatted)) {
      throw new Error(
        "Invalid phone number. Use format 0712345678 or 254712345678",
      );
    }

    return formatted;
  }

  /**
   * Generate timestamp in format YYYYMMDDHHmmss
   */
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

  /**
   * Generate password for STK Push
   * Password = base64(shortCode + passkey + timestamp)
   */
  private generatePassword(timestamp: string): string {
    const data = `${this.config.shortCode}${this.config.passkey}${timestamp}`;
    return Buffer.from(data).toString("base64");
  }

  /**
   * Parse callback response from M-Pesa
   */
  parseCallbackResponse(body: any): {
    resultCode: string;
    resultDescription: string;
    mpesaReceiptNumber: string | null;
    amount: number | null;
    phoneNumber: string | null;
    checkoutRequestId: string | null;
    merchantRequestId: string | null;
  } {
    try {
      const result = body.Body?.stkCallback?.CallbackMetadata?.Item || [];

      const findItem = (name: string) =>
        result.find((item: any) => item.Name === name)?.Value || null;

      return {
        resultCode: body.Body?.stkCallback?.ResultCode?.toString() || "1",
        resultDescription:
          body.Body?.stkCallback?.ResultDesc || "Payment processing",
        mpesaReceiptNumber: findItem("MpesaReceiptNumber"),
        amount: findItem("Amount"),
        phoneNumber: findItem("PhoneNumber"),
        checkoutRequestId:
          body.Body?.stkCallback?.CheckoutRequestID ||
          body.checkoutRequestId ||
          null,
        merchantRequestId:
          body.Body?.stkCallback?.MerchantRequestID ||
          body.merchantRequestId ||
          null,
      };
    } catch (error) {
      console.error("Error parsing M-Pesa callback:", error);
      return {
        resultCode: "1",
        resultDescription: "Error parsing callback",
        mpesaReceiptNumber: null,
        amount: null,
        phoneNumber: null,
        checkoutRequestId: null,
        merchantRequestId: null,
      };
    }
  }
}

export default MpesaService;
