import { getAuthHeaders } from "@/lib/api/authHeaders";

export interface SalonTransaction {
  _id: string;
  appointmentId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerImage?: string;
  serviceName?: string;
  appointmentDate?: string;
  amount?: number;
  currency?: string;
  stripeSessionId?: string;
  status?: string;
  paidAt?: string | Date;
  createdAt?: string | Date;
}

export interface TransactionListResult {
  success: boolean;
  data: SalonTransaction[];
  message?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Admin: fetch only transactions linked to this admin's own services.
export async function getAdminTransactions(): Promise<TransactionListResult> {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: await getAuthHeaders(),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: result?.message || "Failed to load transactions.",
      };
    }

    const list = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [];

    return {
      success: true,
      data: list as SalonTransaction[],
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Unable to load transactions.",
    };
  }
}

// Fetch only the signed-in customer's payments. The Express API derives the
// owner from the session; no customer email or id is sent by the browser.
export async function getMyTransactions(): Promise<TransactionListResult> {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: await getAuthHeaders(),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: result?.message || "Failed to load your payment history.",
      };
    }

    const list = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [];

    return {
      success: true,
      data: list as SalonTransaction[],
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Unable to load your payment history.",
    };
  }
}
