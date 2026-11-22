import { getAuthHeaders } from "@/lib/api/authHeaders";

export interface SalonService {
  _id: string;
  serviceName: string;  
  image: string;
  category: string;
  price: number;
  duration: string | number;
  shortDescription?: string;
  description: string;
  isActive?: boolean;
  status?: "active" | "inactive";
  createdAt?: string;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


export async function getSalonServices(): Promise<SalonService[]> {
  try {
    // get the latest data
    const response = await fetch(`${API_URL}/services`, {
      cache: "no-store",
    });

    // Convert the API response into JSON format
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to load services.");
    }

    // Check if the API directly returns an array
    if (Array.isArray(result)) {
      return result;
    }

    // Check if the services array exists inside the data property
    if (Array.isArray(result.data)) {
      return result.data;
    }
    return [];

  } catch (error: unknown) {
    console.error("Error fetching services:", error);
    return [];
  }
}

// Fetch single salon service details by ID
export async function getServiceById(serviceId: string): Promise<SalonService | null> {
  try {
    const response = await fetch(`${API_URL}/services/${serviceId}`, {
      cache: "no-store",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to load service details.");
    }

    if (result && typeof result === "object" && result.data) {
      return result.data as SalonService;
    }
    return result as SalonService;
  } catch (error: unknown) {
    console.error("Error fetching service details:", error);
    return null;
  }
}

export interface ServiceListResult {
  success: boolean;
  data: SalonService[];
  message?: string;
}

// Admin: load every service, including inactive ones, so they can be
// reactivated from the Manage Services page.
export async function getAdminServices(): Promise<ServiceListResult> {
  try {
    const response = await fetch(`${API_URL}/services?includeInactive=true`, {
      cache: "no-store",
      credentials: "include",
      headers: await getAuthHeaders(),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: result?.message || "Failed to load services.",
      };
    }

    const list = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [];

    return {
      success: true,
      data: list as SalonService[],
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Unable to load services.",
    };
  }
}
