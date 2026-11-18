import type {
  ImageInputMode,
  PasswordValidationResult,
  SignUpParsedData,
} from "@/types/auth";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validatePasswordRules(
  password: string
): PasswordValidationResult {
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    isValid: hasMinLength && hasUppercase && hasLowercase,
  };
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file (PNG, JPG, WEBP).";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image size must be less than 5MB.";
  }
  return null;
}

export function extractSignUpFormData(
  formData: FormData,
  imageMode: ImageInputMode
): SignUpParsedData {
  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const rawImageUrl = formData.get("imageUrl");
  const rawImageFile = formData.get("imageFile");

  return {
    name: typeof rawName === "string" ? rawName.trim() : "",
    email: typeof rawEmail === "string" ? rawEmail.trim() : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
    imageMode,
    imageFile:
      rawImageFile instanceof File && rawImageFile.size > 0
        ? rawImageFile
        : null,
    imageUrl: typeof rawImageUrl === "string" ? rawImageUrl.trim() : "",
  };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}