// Define the interface for service payload based on your requirements
export interface CreateServicePayload {
  name: string;
  image: string;
  category: string;
  price: number;
  duration: string;
  shortDescription: string;
  description: string;
  isActive?: boolean;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;


// Reusable function to create a new service
export async function createSalonService(serviceData: CreateServicePayload) {
  try {
    // Backend API URL from environment variables or direct localhost fallback

    const response = await fetch(`${API_URL}/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serviceData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create service.");
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: errorMessage,
    };
  }
}