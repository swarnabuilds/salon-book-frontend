export interface CustomerUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  isBlocked: boolean;
  emailVerified?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CustomerListResult {
  success: boolean;
  data: CustomerUser[];
  message?: string;
}

export interface CustomerUpdateResult {
  success: boolean;
  data?: CustomerUser;
  message?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function readCustomerList(payload: unknown): CustomerUser[] {
  if (Array.isArray(payload)) {
    return payload as CustomerUser[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: CustomerUser[] }).data;
  }

  return [];
}

// Fetch all registered customers for the admin dashboard.
export async function getCustomers(): Promise<CustomerListResult> {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message:
          result?.message || "Failed to load registered customers.",
      };
    }

    return {
      success: true,
      data: readCustomerList(result),
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Unable to load registered customers.",
    };
  }
}

// Block or unblock a customer. Only admins can call this endpoint.
export async function setCustomerBlocked(
  userId: string,
  isBlocked: boolean
): Promise<CustomerUpdateResult> {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/block`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isBlocked }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        message:
          result?.message || "Failed to update customer status.",
      };
    }

    return {
      success: true,
      data: result?.data as CustomerUser | undefined,
      message:
        result?.message ||
        (isBlocked
          ? "Customer blocked successfully."
          : "Customer unblocked successfully."),
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update customer status.",
    };
  }
}
