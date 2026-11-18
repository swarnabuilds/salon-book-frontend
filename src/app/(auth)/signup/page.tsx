"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
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
import { ProfileImagePicker } from "@/components/auth/ProfileImagePicker";
import { PasswordRulesChecklist } from "@/components/auth/PasswordRulesChecklist";
import {
  extractSignUpFormData,
  getErrorMessage,
  validatePasswordRules,
} from "@/lib/validation/authValidation";
import { uploadImageToImgBB } from "@/lib/uploadImage";
import { authClient } from "@/lib/auth-client";
import type { ImageInputMode } from "@/types/auth";

export default function SignUpPage() {
  const router = useRouter();

  const [imageMode, setImageMode] = useState<ImageInputMode>("upload");
  const [passwordPreview, setPasswordPreview] = useState<string>("");
  const [nameInitial, setNameInitial] = useState<string>("SB");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const passwordValidation = useMemo(
    () => validatePasswordRules(passwordPreview),
    [passwordPreview]
  );

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const rawFormData = new FormData(event.currentTarget);
    const parsedData = extractSignUpFormData(rawFormData, imageMode);

    if (!parsedData.name) {
      toast.error("Full Name is required.");
      return;
    }

    if (!parsedData.email) {
      toast.error("Email address is required.");
      return;
    }

    const finalPasswordCheck = validatePasswordRules(parsedData.password);
    if (!finalPasswordCheck.isValid) {
      toast.error("Please satisfy all password security rules.");
      return;
    }

    setIsSubmitting(true);

    try {
      let resolvedImageUrl: string | undefined;

      // ImgBB Upload integration
      if (parsedData.imageMode === "upload" && parsedData.imageFile) {
        toast.info("Uploading your profile photo to ImgBB...");
        resolvedImageUrl = await uploadImageToImgBB(parsedData.imageFile);
      } else if (parsedData.imageMode === "url" && parsedData.imageUrl) {
        resolvedImageUrl = parsedData.imageUrl;
      }

      const { error } = await authClient.signUp.email({
        name: parsedData.name,
        email: parsedData.email,
        password: parsedData.password,
        image: resolvedImageUrl,
      });

      if (error) {
        toast.error(error.message || "Registration failed. Please try again.");
        return;
      }

      toast.success("Welcome to SalonBook! Account created successfully.");
      router.push("/signin");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Something went wrong during registration.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/signin",
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Google authentication failed."));
      setIsGoogleLoading(false);
    }
  };

  const isBusy = isSubmitting || isGoogleLoading;

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-12 bg-[#FAF8F5] text-stone-900">
      {/* Left Editorial Showcase */}
      <AuthShowcasePanel
        headline="Elevate your self-care ritual with effortless booking."
        subheadline="Explore signature hair, facial, and spa treatments, reserve your preferred time slot in seconds, and manage appointments seamlessly."
      />

      {/* Right Form Container */}
      <div className="lg:col-span-7 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="flex lg:hidden items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-stone-900 flex items-center justify-center text-amber-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xl font-serif font-semibold">SalonBook</span>
            </Link>
            <Link
              href="/browse-services"
              className="text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Explore Services →
            </Link>
          </div>

          <Card className="border-stone-200/80 shadow-2xl shadow-stone-200/50 bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="space-y-1.5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight text-stone-900">
                  Create your account
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px]"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Customer Portal
                </Badge>
              </div>
              <CardDescription className="text-stone-500 text-sm">
                Join SalonBook to request appointments, track bookings, and pay
                securely.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={handleGoogleSignUp}
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
                  or register with email
                </span>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <ProfileImagePicker
                  mode={imageMode}
                  onModeChange={setImageMode}
                  fallbackInitial={nameInitial}
                />

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-stone-700 font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Swarna Sutradhar"
                      required
                      onChange={(e) => {
                        const firstChar = e.target.value.trim().charAt(0);
                        setNameInitial(
                          firstChar ? firstChar.toUpperCase() : "SB"
                        );
                      }}
                      className="pl-10 h-10 rounded-xl border-stone-200 focus-visible:ring-stone-900"
                    />
                  </div>
                </div>

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
                      required
                      className="pl-10 h-10 rounded-xl border-stone-200 focus-visible:ring-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-stone-700 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      required
                      onChange={(e) => setPasswordPreview(e.target.value)}
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

                  <PasswordRulesChecklist validation={passwordValidation} />
                </div>

                <Button
                  type="submit"
                  disabled={isBusy}
                  className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-md transition-all group mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Customer Account
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 border-t border-stone-100 pt-4 text-center">
              <p className="text-sm text-stone-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-stone-900 underline underline-offset-4 hover:text-amber-700"
                >
                  Sign In
                </Link>
              </p>
              <p className="text-[11px] text-stone-400">
                Public registration provisions Customer accounts only. Admin
                roles are assigned securely on the server.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2.5 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}