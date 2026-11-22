"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getMyAppointments,
  SalonAppointment,
} from "@/lib/action/appointmentActions";
import {
  Sparkles,
  Mail,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  Edit3,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

interface ToastState {
  type: "success" | "error";
  message: string;
}

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  isBlocked?: boolean;
}

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "U").trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const {
    data: session,
    isPending: isSessionLoading,
    refetch,
  } = authClient.useSession();

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const user = session?.user as ExtendedUser | undefined;
  const userEmail = user?.email || "";
  const userName = user?.name || "Salon Guest";
  const userImage = user?.image || "";
  const userRole = String(user?.role || "customer").toLowerCase();
  const userPhone = user?.phone || user?.phoneNumber || "";

  useEffect(() => {
    if (!isSessionLoading && !user) {
      router.replace("/sign-in");
    }
  }, [isSessionLoading, user, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!userEmail) return;
    let active = true;

    getMyAppointments(userEmail).then((res) => {
      if (!active) return;
      setAppointments(res.success ? res.data : []);
    });

    return () => {
      active = false;
    };
  }, [userEmail]);

  const startEditing = () => {
    setNameInput(user?.name || "");
    setPhoneInput(user?.phone || user?.phoneNumber || "");
    setImageInput(user?.image || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNameInput("");
    setPhoneInput("");
    setImageInput("");
  };

  const stats = useMemo(() => {
    const totalBookings = appointments.length;
    const confirmedCount = appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "confirmed"
    ).length;
    const paidBookings = appointments.filter(
      (item) => String(item.paymentStatus || "").toLowerCase() === "paid"
    );
    const totalSpent = paidBookings.reduce(
      (sum, item) => sum + Number(item.servicePrice || 0),
      0
    );

    return {
      totalBookings,
      confirmedCount,
      paidCount: paidBookings.length,
      totalSpent,
    };
  }, [appointments]);

  // Upload image file to ImgBB if configured
  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!imgbbApiKey) {
      setToast({
        type: "error",
        message:
          "ImgBB API key is not configured. You can paste a direct image URL instead.",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.data?.url) {
        throw new Error(data?.error?.message || "Image upload failed.");
      }

      setImageInput(String(data.data.url));
      setToast({
        type: "success",
        message: "Profile image uploaded successfully.",
      });
    } catch (err: unknown) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to upload image.",
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    const trimmedPhone = phoneInput.trim();
    const trimmedImage = imageInput.trim();

    if (!trimmedName) {
      setToast({
        type: "error",
        message: "Please enter your full name.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Only permitted fields (name, image, phone) are sent; role and isBlocked are never modifiable
      const updatePayload: {
        name: string;
        image?: string;
        phone?: string;
      } = {
        name: trimmedName,
        image: trimmedImage,
        phone: trimmedPhone,
      };

      const updateFn = (
        authClient as unknown as {
          updateUser?: (payload: {
            name: string;
            image?: string;
            phone?: string;
          }) => Promise<{ error?: { message?: string } | null }>;
        }
      ).updateUser;

      if (typeof updateFn === "function") {
        const result = await updateFn(updatePayload);
        if (result?.error) {
          setToast({
            type: "error",
            message: result.error.message || "Could not update profile.",
          });
          return;
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl && userEmail) {
        await fetch(`${apiUrl}/users/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: userEmail,
            name: trimmedName,
            image: trimmedImage,
            phone: trimmedPhone,
          }),
        }).catch(() => null);
      }

      if (typeof refetch === "function") {
        await refetch();
      }

      setIsEditing(false);
      setToast({
        type: "success",
        message: "Profile information updated successfully.",
      });
    } catch {
      setToast({
        type: "error",
        message: "Something went wrong while updating profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#110F0B] text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Loading your profile...</span>
      </div>
    );
  }

  if (!user) return null;

  const activePreviewImage = isEditing ? imageInput : userImage;

  return (
    <>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 flex max-w-md items-center gap-3.5 rounded-2xl border px-5 py-4 text-sm font-bold shadow-2xl backdrop-blur-md sm:text-base ${
            toast.type === "success"
              ? "border-emerald-400/50 bg-[#181510]/95 text-emerald-200"
              : "border-rose-400/50 bg-[#181510]/95 text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
            className="ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Fancy Profile Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-[#1F1A12] via-[#181510] to-[#120F0B] p-6 shadow-2xl sm:p-8">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#A68B5B]/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/25 to-[#120F0C] text-2xl font-extrabold text-amber-300 shadow-lg shadow-amber-950/50">
                  {activePreviewImage ? (
                    <img
                      src={activePreviewImage}
                      alt={userName}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(userName, userEmail)}</span>
                  )}
                  <span
                    title="Active Account"
                    className="absolute right-1.5 bottom-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#181510] bg-emerald-400"
                  />
                </div>

                {/* User Identity */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase">
                      <Sparkles className="h-3.5 w-3.5" />
                      Customer Profile
                    </span>
                    <span className="rounded-full border border-stone-700 bg-[#14110D] px-3 py-1 text-xs font-semibold text-stone-300 uppercase">
                      {userRole}
                    </span>
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    {userName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-stone-300 sm:text-base">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-400" />
                      <span>{userEmail || "No email associated"}</span>
                    </span>
                    {userPhone && (
                      <span className="flex items-center gap-2 text-stone-300">
                        <Phone className="h-4 w-4 text-amber-400" />
                        <span>{userPhone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => (isEditing ? cancelEditing() : startEditing())}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-sm font-bold text-stone-200 transition hover:border-amber-400/45 hover:text-amber-300"
                >
                  <Edit3 className="h-4 w-4 text-amber-400" />
                  <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
                </button>

                <Link
                  href="/dashboard/customer/appointments"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                >
                  <span>My Appointments</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Salon Activity Highlights */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-amber-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Total Bookings
                </span>
                <CalendarCheck className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {stats.totalBookings}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Appointment requests submitted
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-emerald-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Confirmed
                </span>
                <UserCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-emerald-300">
                {stats.confirmedCount}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Confirmed salon appointments
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-sky-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Paid Sessions
                </span>
                <ShieldCheck className="h-5 w-5 text-sky-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-sky-300">
                {stats.paidCount}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Completed Stripe payments
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-amber-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Total Paid
                </span>
                <CreditCard className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-amber-300">
                ${stats.totalSpent.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Total settled amount
              </p>
            </div>
          </div>

          {/* Account Details & Edit Card */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm text-stone-400">
                    Update your name, phone number, or profile image.
                  </p>
                </div>
                <span className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  Active Account
                </span>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="block text-xs font-bold tracking-wider text-stone-400 uppercase"
                      >
                        Full Name
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your full name"
                        className="mt-2 w-full rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-base font-medium text-white outline-none transition focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-phone"
                        className="block text-xs font-bold tracking-wider text-stone-400 uppercase"
                      >
                        Phone Number
                      </label>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+880 1XXX-XXXXXX"
                        className="mt-2 w-full rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-base font-medium text-white outline-none transition focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="profile-image-url"
                        className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-stone-400 uppercase"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                        <span>Profile Image (URL or Upload)</span>
                      </label>

                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20">
                        {isUploadingImage ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {isUploadingImage ? "Uploading..." : "Upload Image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingImage || isSaving}
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <input
                      id="profile-image-url"
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="https://example.com/your-photo.jpg"
                      className="w-full rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isSaving || isUploadingImage}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A] disabled:opacity-60"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-stone-800/90 bg-[#14110D] p-4">
                    <dt className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                      Full Name
                    </dt>
                    <dd className="mt-1.5 text-base font-bold text-white">
                      {userName}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-stone-800/90 bg-[#14110D] p-4">
                    <dt className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                      Email Address
                    </dt>
                    <dd className="mt-1.5 truncate text-base font-bold text-amber-200">
                      {userEmail || "Not available"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-stone-800/90 bg-[#14110D] p-4">
                    <dt className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                      Phone Number
                    </dt>
                    <dd className="mt-1.5 text-base font-bold text-stone-100">
                      {userPhone || "Not provided"}
                    </dd>
                  </div>

                  <div className="rounded-xl border border-stone-800/90 bg-[#14110D] p-4">
                    <dt className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                      Account Role
                    </dt>
                    <dd className="mt-1.5 text-base font-bold text-stone-100 capitalize">
                      {userRole}
                    </dd>
                  </div>
                </dl>
              )}
            </div>

            {/* Quick Navigation Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-amber-400/25 bg-gradient-to-b from-[#1E1912] to-[#16130E] p-6">
              <div className="space-y-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/10 text-amber-300">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold text-white">
                  SalonBook Quick Access
                </h2>
                <p className="text-sm leading-relaxed text-stone-300">
                  Browse available salon services, track your appointment
                  requests, and pay for confirmed bookings.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <Link
                  href="/services"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                >
                  <span>Browse Services</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/customer/appointments"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300"
                >
                  <span>My Appointments</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}