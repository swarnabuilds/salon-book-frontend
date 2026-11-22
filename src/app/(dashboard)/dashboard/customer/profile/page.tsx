"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  getMyAppointments,
  SalonAppointment,
} from "@/lib/action/appointmentActions";
import { uploadImageToImgbb } from "@/lib/uploadImage";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CalendarCheck,
  Check,
  CreditCard,
  Edit3,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  X,
} from "lucide-react";

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

function SummaryCard({
  label,
  value,
  hint,
  icon,
  accent,
  valueClass = "text-white",
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  accent: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-[#181510] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
          {label}
        </span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accent}`}
        >
          {icon}
        </span>
      </div>
      <p className={`mt-4 text-2xl font-extrabold sm:text-3xl ${valueClass}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-stone-500">{hint}</p>
    </div>
  );
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const {
    data: session,
    isPending: isSessionLoading,
    refetch,
  } = authClient.useSession();

  const sessionUser = session?.user as ExtendedUser | undefined;
  const userRole = String(sessionUser?.role || "customer")
    .trim()
    .toLowerCase();
  const isCustomer = userRole === "customer";

  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const userEmail = sessionUser?.email || "";
  const userName = sessionUser?.name || "Salon Guest";
  const userImage = sessionUser?.image || "";
  const userPhone = sessionUser?.phone || sessionUser?.phoneNumber || "";

  useEffect(() => {
    if (isSessionLoading) return;

    if (!sessionUser) {
      router.replace("/signin");
      return;
    }

    if (sessionUser.isBlocked) {
      router.replace("/signin?blocked=1");
      return;
    }

    if (!isCustomer) {
      router.replace("/dashboard/admin");
    }
  }, [isSessionLoading, sessionUser, isCustomer, router]);

  useEffect(() => {
    if (isSessionLoading || !isCustomer || !userEmail) return;

    let active = true;

    getMyAppointments(userEmail).then((res) => {
      if (!active) return;
      setAppointments(res.success ? res.data : []);
    });

    return () => {
      active = false;
    };
  }, [isSessionLoading, isCustomer, userEmail]);

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

  const startEditing = () => {
    setNameInput(sessionUser?.name || "");
    setPhoneInput(sessionUser?.phone || sessionUser?.phoneNumber || "");
    setImageInput(sessionUser?.image || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNameInput("");
    setPhoneInput("");
    setImageInput("");
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);

    const result = await uploadImageToImgbb(file);

    setIsUploadingImage(false);
    event.target.value = "";

    if (!result.success || !result.url) {
      toast.error(result.message || "Failed to upload image.");
      return;
    }

    setImageInput(result.url);
    toast.success("Profile image uploaded.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = nameInput.trim();
    const trimmedPhone = phoneInput.trim();
    const trimmedImage = imageInput.trim();

    if (!trimmedName) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsSaving(true);

    try {
      // Only permitted fields are sent. role and isBlocked are never editable.
      const { error } = await authClient.updateUser({
        name: trimmedName,
        image: trimmedImage,
        phone: trimmedPhone,
      });

      if (error) {
        toast.error(error.message || "Could not update profile.");
        return;
      }

      await refetch();
      setIsEditing(false);
      toast.success("Profile information updated successfully.");
    } catch {
      toast.error("Something went wrong while updating your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSessionLoading || !isCustomer) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#110F0B] text-lg font-semibold text-stone-300">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        <span>Checking your account...</span>
      </div>
    );
  }

  const activePreviewImage = isEditing ? imageInput : userImage;

  return (
    <section className="min-h-screen bg-[#110F0B] px-4 py-8 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Profile banner */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-[#1F1A12] via-[#181510] to-[#120F0B] p-6 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#A68B5B]/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/25 to-[#120F0C] text-2xl font-extrabold text-amber-300 shadow-lg shadow-amber-950/50">
                {activePreviewImage ? (
                  <img
                    src={activePreviewImage}
                    alt={userName}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(userName, userEmail)}</span>
                )}
                <span
                  title="Active account"
                  className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#181510] bg-emerald-400"
                />
              </div>

              {/* Identity */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Customer Profile
                  </span>
                  <span className="rounded-full border border-stone-700 bg-[#14110D] px-3 py-1 text-xs font-semibold uppercase text-stone-300">
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
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-400" />
                      <span>{userPhone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
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

        {/* Activity stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Bookings"
            value={stats.totalBookings}
            hint="Appointment requests submitted"
            icon={<CalendarCheck className="h-4 w-4 text-amber-300" />}
            accent="border-amber-400/30 bg-amber-500/10"
          />
          <SummaryCard
            label="Confirmed"
            value={stats.confirmedCount}
            hint="Approved salon appointments"
            icon={<UserCheck className="h-4 w-4 text-emerald-300" />}
            accent="border-emerald-400/30 bg-emerald-500/10"
            valueClass="text-emerald-300"
          />
          <SummaryCard
            label="Paid Sessions"
            value={stats.paidCount}
            hint="Completed Stripe payments"
            icon={<ShieldCheck className="h-4 w-4 text-sky-300" />}
            accent="border-sky-400/30 bg-sky-500/10"
            valueClass="text-sky-300"
          />
          <SummaryCard
            label="Total Paid"
            value={`৳${stats.totalSpent.toLocaleString()}`}
            hint="Total settled amount"
            icon={<CreditCard className="h-4 w-4 text-amber-300" />}
            accent="border-amber-400/30 bg-amber-500/10"
            valueClass="text-amber-300"
          />
        </div>

        {/* Details and quick access */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-stone-800 bg-[#181510] p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
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
                      className="block text-xs font-bold uppercase tracking-wider text-stone-400"
                    >
                      Full Name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      placeholder="Enter your full name"
                      className="mt-2 w-full rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-base font-medium text-white outline-none transition focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-phone"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-400"
                    >
                      Phone Number
                    </label>
                    <input
                      id="profile-phone"
                      type="tel"
                      value={phoneInput}
                      onChange={(event) => setPhoneInput(event.target.value)}
                      placeholder="+880 1XXX-XXXXXX"
                      className="mt-2 w-full rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-base font-medium text-white outline-none transition focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Profile image */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
                      <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                      Profile Image
                    </span>

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
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-stone-800 bg-[#14110D] p-3 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-800 bg-stone-900 text-amber-300">
                      {imageInput ? (
                        <img
                          src={imageInput}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </div>
                    <p className="min-w-0 flex-1 text-xs text-stone-500">
                      Upload a JPG or PNG file, or paste a direct image URL
                      below. Uploaded images are hosted on ImgBB.
                    </p>
                  </div>

                  <input
                    id="profile-image-url"
                    type="url"
                    value={imageInput}
                    onChange={(event) => setImageInput(event.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                    className="w-full rounded-xl border border-stone-700 bg-[#14110D] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-amber-400"
                  />
                </div>

                <p className="flex items-start gap-2 rounded-xl border border-stone-800 bg-[#14110D] px-4 py-3 text-xs text-stone-400">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                  Email, role, and account status cannot be changed from this
                  page.
                </p>

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
                  <dt className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Full Name
                  </dt>
                  <dd className="mt-1.5 text-base font-bold text-white">
                    {userName}
                  </dd>
                </div>

                <div className="rounded-xl border border-stone-800/90 bg-[#14110D] p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Email Address
                  </dt>
                  <dd className="mt-1.5 truncate text-base font-bold text-amber-200">
                    {userEmail || "Not available"}
                  </dd>
                </div>

                <div className="rounded-xl border border-stone-800/90 bg-[#14110D] p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Phone Number
                  </dt>
                  <dd className="mt-1.5 text-base font-bold text-stone-100">
                    {userPhone || "Not provided"}
                  </dd>
                </div>

                <div className="rounded-xl border border-stone-800/90 bg-[#14110D] p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Account Role
                  </dt>
                  <dd className="mt-1.5 text-base font-bold capitalize text-stone-100">
                    {userRole}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* Quick access */}
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
  );
}
