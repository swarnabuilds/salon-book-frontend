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