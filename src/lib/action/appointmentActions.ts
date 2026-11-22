import { getAuthHeaders } from "@/lib/api/authHeaders";

export interface CreateAppointmentPayload {
  serviceId: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
}

export interface SalonAppointment {
  _id: string;
  serviceId: string;
  customerId?: string;
  customerName?: string;
  customerEmail: string;
  serviceName: string;
  serviceImage?: string;
  serviceCategory?: string;
  customerImage?: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string;
  paymentStatus?: "paid" | "unpaid" | string;
  createdAt?: string;
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Submit a new appointment booking request to backend API
export async function createAppointment(payload: CreateAppointmentPayload) {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to book appointment.");
    }

    return {
      success: true,
      data: result.data,
      message: result.message || "Appointment booked successfully.",
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


// Load only the signed-in customer's appointments. No email or user id is
// sent from the browser; the Express API scopes the query from the session.
export async function getMyAppointments(): Promise<{
  success: boolean;
  data: SalonAppointment[];
  message?: string;
}> {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: await getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load appointments.");
    }

    const ownAppointments: SalonAppointment[] = Array.isArray(result)
      ? result
      : Array.isArray(result.data)
        ? result.data
        : [];

    return {
      success: true,
      data: ownAppointments,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch appointments.";
    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
}


export async function cancelAppointment(appointmentId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to cancel appointment.");
    }

    return {
      success: true,
      message: result.message || "Appointment cancelled successfully.",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unable to cancel appointment.";
    return {
      success: false,
      message: errorMessage,
    };
  }
}


// Admin: get appointments for this admin's own services only.
export async function getAllAppointments(): Promise<{
  success: boolean;
  data: SalonAppointment[];
  message?: string;
}> {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: await getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load all appointments.");
    }

    const allList: SalonAppointment[] = Array.isArray(result)
      ? result
      : Array.isArray(result.data)
        ? result.data
        : [];

    return {
      success: true,
      data: allList,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch appointments.";
    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
}

// Admin: Update appointment status (confirmed or cancelled only)
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "confirmed" | "cancelled"
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch(
      `${API_URL}/appointments/${appointmentId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({ status }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update appointment status.");
    }

    return {
      success: true,
      message: result.message || `Appointment ${status} successfully.`,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to update appointment status.";
    return {
      success: false,
      message: errorMessage,
    };
  }
}