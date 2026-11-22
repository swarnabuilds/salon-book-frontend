"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { AuthShowcasePanel } from "@/components/auth/AuthShowcasePanel";
import {
  extractSignInFormData,
  getDashboardRouteByRole,
  getErrorMessage,
  resolveSessionUser,
} from "@/lib/validation/authValidation";
import { authClient } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api/authHeaders";
import { GoogleIcon } from "@/components/auth/GoogleIcon";

export default function SignInPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const rawFormData = new FormData(event.currentTarget);
    const { email, password } = extractSignInFormData(rawFormData);

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Invalid email or password.");
        return;
      }

      // Fetch active session to verify blocked status and role-based route
      const sessionResponse = await authClient.getSession();
      const user = resolveSessionUser(sessionResponse.data);

      if (user?.isBlocked) {
        await authClient.signOut();
        clearAuthTokenCache();
        toast.error(
          "Your account has been suspended. Please contact SalonBook support."
        );
        return;
      }

      const targetDashboard = getDashboardRouteByRole(user?.role);

      toast.success(
        `Welcome back${user?.name ? `, ${user.name}` : ""}! Redirecting...`
      );
      router.push(targetDashboard);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Google sign-in failed."));
      setIsGoogleLoading(false);
    }
  };

  const isBusy = isSubmitting || isGoogleLoading;

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-12 bg-[#FAF8F5] text-stone-900">
      {/* Left Reusable Editorial Showcase Panel */}
      <AuthShowcasePanel
        headline="Welcome back to your personal beauty sanctuary."
        subheadline="Sign in to view upcoming appointments, manage salon bookings, or oversee studio operations from your dedicated dashboard."
      />

      {/* Right Sign In Form Panel */}
      <div className="lg:col-span-7 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Mobile Brand Header */}
          <div className="flex lg:hidden items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-stone-900 flex items-center justify-center text-amber-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xl font-serif font-semibold">SalonBook</span>
            </Link>
            <Link
              href="/services"
              className="text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Explore Services →
            </Link>
          </div>

          <Card className="border-stone-200/80 shadow-2xl shadow-stone-200/50 bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="space-y-1.5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-stone-900">
                  Welcome back
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-800 border-amber-200 gap-1 text-[11px]"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Secure Access
                </Badge>
              </div>
              <CardDescription className="text-stone-500 text-sm">
                Sign in with your SalonBook credentials or Google account.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Google OAuth Login */}
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={handleGoogleSignIn}
                className="w-full h-11 rounded-xl border-stone-200 hover:bg-stone-50 text-stone-800 font-medium transition-all"
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </Button>

              <div className="relative flex items-center justify-center">
                <Separator className="bg-stone-200" />
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                  or sign in with email
                </span>
              </div>

              {/* Native FormData Login Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-stone-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="pl-10 h-10 rounded-xl border-stone-200 focus-visible:ring-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-stone-700 font-medium"
                    >
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="pl-10 pr-10 h-10 rounded-xl border-stone-200 focus-visible:ring-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isBusy}
                  className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-md transition-all group mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 border-t border-stone-100 pt-4 text-center">
              <p className="text-sm text-stone-600">
                New to SalonBook?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-stone-900 underline underline-offset-4 hover:text-amber-700"
                >
                  Create a Customer Account
                </Link>
              </p>
              <p className="text-[11px] text-stone-400">
                Automatically routes you to the Admin or Customer workspace
                based on your verified role.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}