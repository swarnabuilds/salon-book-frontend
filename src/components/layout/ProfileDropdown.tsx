"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, User, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDashboardRouteByRole } from "@/lib/validation/authValidation";
import type { ProfileDropdownProps } from "@/types/navigation";

export function ProfileDropdown({
  name,
  email,
  image,
  role = "customer",
  onLogout,
  isLoggingOut,
}: ProfileDropdownProps) {
  const router = useRouter();

  // Get dashboard URL based on user role
  const dashboardHref = getDashboardRouteByRole(role);

  // Extract first character for avatar fallback
  const fallbackInitial = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      {/* Profile Trigger Button */}
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/90 p-1.5 pr-3 shadow-sm hover:border-amber-400 hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer select-none">
        <Avatar className="h-8 w-8 border border-amber-200">
          <AvatarImage src={image || ""} alt={name} className="object-cover" />
          <AvatarFallback className="bg-amber-100 text-amber-900 font-serif text-xs font-semibold">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline-block text-xs font-medium text-stone-800 max-w-[110px] truncate">
          {name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl border-stone-200/80 bg-white/95 backdrop-blur-md p-2 shadow-2xl z-50"
      >
        {/* User Info Header (Name, Email & Role Badge) */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-2">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900 truncate">
                  {name}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] capitalize px-1.5 py-0"
                >
                  {role}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 truncate">{email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-stone-100" />

        {/* My Profile Link */}
        <DropdownMenuItem
          onClick={() => router.push(`${getDashboardRouteByRole(role)}/profile`)}
          className="rounded-xl cursor-pointer py-2.5 flex items-center gap-2 text-stone-700 focus:bg-amber-50 focus:text-amber-900 font-medium text-xs"
        >
          <User className="h-4 w-4 text-amber-700" />
          <span>My Profile</span>
        </DropdownMenuItem>

        {/* Dashboard Link */}
        <DropdownMenuItem
          onClick={() => router.push(dashboardHref)}
          className="rounded-xl cursor-pointer py-2.5 flex items-center gap-2 text-stone-700 focus:bg-amber-50 focus:text-amber-900 font-medium text-xs"
        >
          <LayoutDashboard className="h-4 w-4 text-amber-700" />
          <span>Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-stone-100" />

        {/* Logout Action */}
        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={() => void onLogout()}
          className="rounded-xl cursor-pointer py-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-700 font-medium text-xs flex items-center"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}