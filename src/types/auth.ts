
// System user roles
export type UserRole = "customer" | "admin";

// Image input selection mode
export type ImageInputMode = "upload" | "url";

// Password security rules state
export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  isValid: boolean;
}

// Sign up form data structure
export interface SignUpParsedData {
  name: string;
  email: string;
  password: string;
  imageMode: ImageInputMode;
  imageFile: File | null;
  imageUrl: string;
}

// Sign in form data structure
export interface SignInParsedData {
  email: string;
  password: string;
}

// Authenticated session user schema
export interface AuthenticatedUserSession {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: UserRole;
  isBlocked?: boolean;
}

// ImgBB API response structure
export interface ImgBBApiResponse {
  data?: {
    display_url: string;
  };
  success: boolean;
  error?: {
    message: string;
  };
}