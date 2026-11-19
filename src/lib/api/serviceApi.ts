export interface SalonService {
  _id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  duration: string;
  shortDescription: string;
  description: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getSalonServices(creatorEmail?: string): Promise<SalonService[]> {
  try {

    // Create a query string if creatorEmail is provided
    const query = creatorEmail
      ? `?createdBy=${encodeURIComponent(creatorEmail.trim().toLowerCase())}`
      : "";

    // Fetch salon services from the backend API
    // get the latest data
    const response = await fetch(`${API_URL}/services${query}`, {
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
