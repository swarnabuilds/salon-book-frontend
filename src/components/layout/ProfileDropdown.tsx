"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, ShieldCheck, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
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
  const dashboardHref = getDashboardRouteByRole(role);
  const fallbackInitial = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      {/* Dropdown Trigger Button */}
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-stone-200 bg-white/90 p-1.5 pr-3.5 shadow-sm hover:border-amber-400 hover:bg-stone-50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer">
        <Avatar className="h-8 w-8 border border-amber-200">
          <AvatarImage src={image || ""} alt={name} className="object-cover" />
          <AvatarFallback className="bg-amber-100 text-amber-900 font-serif text-xs font-semibold">
            {fallbackInitial}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline-block text-xs font-medium text-stone-800 max-w-[110px] truncate">
          {name}
        </span>
      </DropdownMenuTrigger>

      {/* Dropdown Menu Content */}
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-2xl border-stone-200/80 bg-white/95 backdrop-blur-md p-2 shadow-xl z-50"
      >
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-stone-900 truncate">
                {name}
              </p>
              <Badge
                variant="secondary"
                className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] capitalize px-1.5 py-0"
              >
                {role === "admin" ? (
                  <ShieldCheck className="h-3 w-3 mr-1 inline" />
                ) : (
                  <User className="h-3 w-3 mr-1 inline" />
                )}
                {role}
              </Badge>
            </div>
            <p className="text-xs text-stone-500 truncate">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-stone-100" />

        <DropdownMenuItem
          onClick={() => router.push(dashboardHref)}
          className="rounded-xl cursor-pointer py-2 flex items-center gap-2 text-stone-700 focus:bg-amber-50 focus:text-amber-900"
        >
          <LayoutDashboard className="h-4 w-4 text-amber-700" />
          <span className="font-medium">Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-stone-100" />

        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={() => void onLogout()}
          className="rounded-xl cursor-pointer py-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}