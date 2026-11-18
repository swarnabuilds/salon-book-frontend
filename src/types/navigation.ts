import type { UserRole } from "./auth";

// Navigation link item structure
export interface NavLinkItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

// Props for user profile dropdown menu
export interface ProfileDropdownProps {
  name: string;
  email: string;
  image?: string | null;
  role?: UserRole;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}