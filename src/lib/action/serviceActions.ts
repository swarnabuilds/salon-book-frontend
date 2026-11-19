// Define the interface for service payload based on your requirements
export interface CreateServicePayload {
  serviceName: string;
  image: string;
  category: string;
  price: number;
  duration: string;
  shortDescription: string;
  description: string;
  isActive?: boolean;
  createdBy: string;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Send service payload to backend API
export async function createSalonService(serviceData: CreateServicePayload) {
  try {
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
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

// Delete a salon service by ID from backend API
export async function deleteSalonService(serviceId: string) {
  try {
    const response = await fetch(`${API_URL}/services/${serviceId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete service.");
    }

    return {
      success: true,
      message: result.message || "Service deleted successfully.",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export interface UpdateServicePayload {
  serviceName: string;
  image: string;
  category: string;
  price: number;
  duration: string;
  shortDescription: string;
  description: string;
  isActive: boolean;
}

// Update an existing salon service by ID via backend PATCH API
export async function updateSalonService(
  serviceId: string,
  serviceData: UpdateServicePayload
) {
  try {
    const response = await fetch(`${API_URL}/services/${serviceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serviceData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update service.");
    }

    return {
      success: true,
      data: result.data,
      message: result.message || "Service updated successfully.",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return {
      success: false,
      message: errorMessage,
    };
  }
}