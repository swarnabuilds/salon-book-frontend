"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getAllAppointments,
  SalonAppointment,
} from "@/lib/action/appointmentActions";
import {
  ShieldCheck,
  Mail,
  Phone,
  Scissors,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Edit3,
  Check,
  X,
  Loader2,
  ArrowUpRight,
  Image as ImageIcon,
  Upload,
  AlertCircle,
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

interface ServiceItem {
  _id: string;
  status?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "A").trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function AdminProfilePage() {
  const router = useRouter();
  const {
    data: session,
    isPending: isSessionLoading,
    refetch,
  } = authClient.useSession();

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [servicesCount, setServicesCount] = useState<number>(0);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const user = session?.user as ExtendedUser | undefined;
  const userEmail = user?.email || "";
  const userName = user?.name || "Salon Administrator";
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
    if (isSessionLoading || !user) return;
    let active = true;

    getAllAppointments()
      .then((res) => {
        if (!active) return;
        setAppointments(res.success ? res.data : []);
      })
      .catch(() => {
        if (!active) return;
        setAppointments([]);
      });

    fetch(`${API_URL}/services`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { data?: ServiceItem[] } | ServiceItem[] | null) => {
        if (!active || !data) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];
        setServicesCount(list.length);
      })
      .catch(() => {
        if (!active) return;
        setServicesCount(0);
      });

    return () => {
      active = false;
    };
  }, [isSessionLoading, user]);

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

  const adminStats = useMemo(() => {
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(
      (item) => String(item.status || "pending").toLowerCase() === "pending"
    ).length;
    const confirmedAppointments = appointments.filter(
      (item) => String(item.status || "").toLowerCase() === "confirmed"
    ).length;

    return {
      servicesCount,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
    };
  }, [appointments, servicesCount]);

  // Upload image to ImgBB when a file is selected
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
          "ImgBB API key is not set. Please paste an image URL instead.",
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
        message: "Admin avatar uploaded successfully.",
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
        message: "Admin name cannot be empty.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Only update permitted profile fields; never send role or isBlocked
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
        const result = await updateFn({
          name: trimmedName,
          image: trimmedImage,
          phone: trimmedPhone,
        });
        if (result?.error) {
          setToast({
            type: "error",
            message: result.error.message || "Could not update profile.",
          });
          return;
        }
      }

      if (userEmail) {
        await fetch(`${API_URL}/users/profile`, {
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
        message: "Admin profile updated successfully.",
      });
    } catch {
      setToast({
        type: "error",
        message: "Something went wrong while saving profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isSessionLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#110F0B] text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Loading admin profile...</span>
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
          {/* Admin Profile Banner */}
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
                    title="Admin Online"
                    className="absolute right-1.5 bottom-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#181510] bg-emerald-400"
                  />
                </div>

                {/* Admin Identity */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin Profile
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

              {/* Action Buttons */}
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
                  href="/dashboard/admin/manage-services"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                >
                  <span>Manage Services</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Admin Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-amber-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Total Services
                </span>
                <Scissors className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {adminStats.servicesCount}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Catalog services in database
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-amber-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Total Bookings
                </span>
                <CalendarCheck className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">
                {adminStats.totalAppointments}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                All customer appointment requests
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-amber-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Pending Review
                </span>
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-amber-300">
                {adminStats.pendingAppointments}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Awaiting admin confirmation
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5 transition hover:border-emerald-400/30">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs font-bold tracking-wider uppercase">
                  Confirmed
                </span>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-emerald-300">
                {adminStats.confirmedAppointments}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Approved salon sessions
              </p>
            </div>
          </div>

          {/* Personal Information & Edit Form */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Administrator Details
                  </h2>
                  <p className="mt-1 text-sm text-stone-400">
                    Update your display name, phone number, or profile picture.
                  </p>
                </div>
                <span className="rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                  Privileged Access
                </span>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="admin-name"
                        className="block text-xs font-bold tracking-wider text-stone-400 uppercase"
                      >
                        Full Name
                      </label>
                      <input
                        id="admin-name"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter administrator name"
                        className="mt-2 w-full rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-base font-medium text-white outline-none transition focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="admin-phone"
                        className="block text-xs font-bold tracking-wider text-stone-400 uppercase"
                      >
                        Phone Number
                      </label>
                      <input
                        id="admin-phone"
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
                        htmlFor="admin-image-url"
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
                      id="admin-image-url"
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="https://example.com/admin-avatar.jpg"
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
                      Role
                    </dt>
                    <dd className="mt-1.5 text-base font-bold text-stone-100 capitalize">
                      {userRole}
                    </dd>
                  </div>
                </dl>
              )}
            </div>

            {/* Admin Shortcuts Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-amber-400/25 bg-gradient-to-b from-[#1E1912] to-[#16130E] p-6">
              <div className="space-y-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/10 text-amber-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold text-white">
                  Salon Operations
                </h2>
                <p className="text-sm leading-relaxed text-stone-300">
                  Review incoming appointment requests, manage active salon
                  services, and monitor customer transactions.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <Link
                  href="/dashboard/admin/appointments"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#A68B5B] px-5 py-3 text-sm font-bold text-stone-950 transition hover:bg-[#B89B6A]"
                >
                  <span>Manage Appointments</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/admin"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-[#14110D] px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400/40 hover:text-amber-300"
                >
                  <span>Admin Overview</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}