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

// Fetch every payment transaction. Used by the admin overview counters.
export async function getTransactions(): Promise<TransactionListResult> {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
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
