export type ImageInputMode = "upload" | "url";

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  isValid: boolean;
}

export interface SignUpParsedData {
  name: string;
  email: string;
  password: string;
  imageMode: ImageInputMode;
  imageFile: File | null;
  imageUrl: string;
}

export interface ImgBBApiResponse {
  data?: {
    display_url: string;
  };
  success: boolean;
  error?: {
    message: string;
  };
}