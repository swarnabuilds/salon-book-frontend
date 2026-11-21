export interface CreateAppointmentPayload {
  serviceId: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerRole?: string;
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
      headers: {
        "Content-Type": "application/json",
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


//get appointment filter by user email
export async function getMyAppointments(customerEmail: string): Promise<{
  success: boolean;
  data: SalonAppointment[];
  message?: string;
}> {
  try {
    const cleanEmail = customerEmail.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, data: [], message: "Customer email is required." };
    }

    const response = await fetch(
      `${API_URL}/appointments?email=${encodeURIComponent(cleanEmail)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load appointments.");
    }

    const rawList: SalonAppointment[] = Array.isArray(result)
      ? result
      : Array.isArray(result.data)
        ? result.data
        : [];

    // Strict rule: Customers can only view their own appointments
    const ownAppointments = rawList.filter(
      (item) =>
        String(item.customerEmail || "")
          .trim()
          .toLowerCase() === cleanEmail
    );

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
      headers: {
        "Content-Type": "application/json",
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