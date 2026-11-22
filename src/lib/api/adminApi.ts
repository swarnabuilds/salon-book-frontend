import { getAuthHeaders } from "@/lib/api/authHeaders";
import type { SalonAppointment } from "@/lib/action/appointmentActions";
import type { SalonService } from "@/lib/api/serviceApi";
import type { SalonTransaction } from "@/lib/api/transactionApi";

export interface AdminOverviewStats {
  totalServices: number;
  activeServices: number;
  totalAppointments: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  paidCount: number;
  totalRevenue: number;
  currency: string;
}

export interface AdminOverviewData {
  stats: AdminOverviewStats;
  services: SalonService[];
  appointments: SalonAppointment[];
  transactions: SalonTransaction[];
}

export interface AdminOverviewResult {
  success: boolean;
  data: AdminOverviewData;
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// All numbers come from the server, which scopes them to the signed-in admin.
export async function getAdminOverview(): Promise<AdminOverviewResult> {
  try {
    const response = await fetch(`${API_URL}/admin/overview`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: await getAuthHeaders(),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        data: {
          stats: {
            totalServices: 0,
            activeServices: 0,
            totalAppointments: 0,
            pendingCount: 0,
            confirmedCount: 0,
            completedCount: 0,
            paidCount: 0,
            totalRevenue: 0,
            currency: "usd",
          },
          services: [],
          appointments: [],
          transactions: [],
        },
        message: result?.message || "Failed to load admin overview.",
      };
    }

    return {
      success: true,
      data: result?.data as AdminOverviewData,
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: {
        stats: {
          totalServices: 0,
          activeServices: 0,
          totalAppointments: 0,
          pendingCount: 0,
          confirmedCount: 0,
          completedCount: 0,
          paidCount: 0,
          totalRevenue: 0,
          currency: "usd",
        },
        services: [],
        appointments: [],
        transactions: [],
      },
      message:
        error instanceof Error ? error.message : "Unable to load admin overview.",
    };
  }
}
