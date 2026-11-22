"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import {
  getDashboardRouteByRole,
  getErrorMessage,
  resolveSessionUser,
} from "@/lib/validation/authValidation";
import { authClient } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api/authHeaders";
import type { NavLinkItem } from "@/types/navigation";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Reactive session state updates immediately on auth changes
  const { data: sessionData, isPending } = authClient.useSession();
  const currentUser = useMemo(
    () => resolveSessionUser(sessionData),
    [sessionData]
  );

  const isAuthenticated = Boolean(currentUser);
  const dashboardHref = getDashboardRouteByRole(currentUser?.role);

  // Build navigation links based on authentication state
  const navLinks: NavLinkItem[] = useMemo(() => {
    const baseLinks: NavLinkItem[] = [
      { label: "Home", href: "/" },
      { label: "Browse Services", href: "/services" },
    ];

    if (isAuthenticated) {
      return [
        ...baseLinks,
        { label: "Dashboard", href: dashboardHref, requiresAuth: true },
      ];
    }

    return baseLinks;
  }, [isAuthenticated, dashboardHref]);

  // Handle user sign out and immediate UI refresh
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      clearAuthTokenCache();
      setMobileMenuOpen(false);
      toast.success("Logged out successfully.");
      router.push("/signin");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to log out."));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-[#FAF8F5]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-amber-300 shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-stone-900">
            SalonBook
          </span>
        </Link>

        {/* Desktop Center Navigation Links with Golden Animated Underline */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium transition-colors hover:text-amber-700 ${
                  isActive ? "text-stone-900 font-semibold" : "text-stone-600"
                }`}
              >
                {link.label}
                {/* Golden Animated Underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Auth Actions / Profile Dropdown */}
        <div className="hidden md:flex items-center gap-3">
          {isPending ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-stone-200/80" />
          ) : isAuthenticated && currentUser ? (
            <ProfileDropdown
              name={currentUser.name}
              email={currentUser.email}
              image={currentUser.image}
              role={currentUser.role}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-stone-700 hover:bg-stone-200/60 hover:text-stone-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-full bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium shadow-sm px-5 transition-all group"
              >
                <span>Sign Up</span>
                <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {!isPending && isAuthenticated && currentUser && (
            <ProfileDropdown
              name={currentUser.name}
              email={currentUser.email}
              image={currentUser.image}
              role={currentUser.role}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 hover:bg-stone-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200/80 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-50 text-amber-900 font-semibold border-l-4 border-amber-500"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-100">
            {isAuthenticated && currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <Avatar className="h-9 w-9 border border-amber-200">
                    <AvatarImage src={currentUser.image || ""} />
                    <AvatarFallback className="bg-amber-100 text-amber-900 font-serif text-xs">
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-stone-500 capitalize">
                      {currentUser.role || "customer"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-9 items-center justify-start rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2 text-amber-700" />
                    Dashboard
                  </Link>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isLoggingOut}
                    onClick={() => void handleLogout()}
                    className="rounded-xl justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? "Wait..." : "Logout"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-stone-900 hover:bg-stone-800 px-4 text-sm font-medium text-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}