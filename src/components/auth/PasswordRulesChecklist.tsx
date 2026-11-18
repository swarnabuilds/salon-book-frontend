import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { PasswordValidationResult } from "@/types/auth";

interface PasswordRulesChecklistProps {
  validation: PasswordValidationResult;
}

export function PasswordRulesChecklist({
  validation,
}: PasswordRulesChecklistProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
      <RuleBadge met={validation.hasMinLength} label="6+ characters" />
      <RuleBadge met={validation.hasUppercase} label="1 uppercase (A-Z)" />
      <RuleBadge met={validation.hasLowercase} label="1 lowercase (a-z)" />
    </div>
  );
}

function RuleBadge({ met, label }: { met: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
        met
          ? "bg-emerald-50/80 border-emerald-200 text-emerald-700 font-medium"
          : "bg-stone-50 border-stone-200/70 text-stone-500"
      }`}
    >
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-stone-300 shrink-0" />
      )}
      <span>{label}</span>
    </div>
  );
}