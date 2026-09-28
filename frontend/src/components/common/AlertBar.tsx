"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Info, AlertCircle, CheckCircle, Bell, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertBarProps {
  message?: React.ReactNode;
  type?: "info" | "warning" | "success" | "notice";
  actionText?: string;
  actionHref?: string;
  dismissible?: boolean;
  className?: string;
}

export function AlertBar({
  message = "National Innovation Notice: All university milestones and research grant tranches are cryptographically verifiable on the National Innovation Ledger.",
  type = "notice",
  actionText,
  actionHref,
  dismissible = false,
  className,
}: AlertBarProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        "border-y px-4 sm:px-6 lg:px-8 py-2 text-xs sm:text-sm transition-all",
        type === "info" && "bg-sky-50 border-sky-200 text-sky-950",
        type === "warning" && "bg-amber-50 border-amber-200 text-amber-950",
        type === "success" && "bg-[#166534]/10 border-[#166534]/20 text-[#14532D]",
        type === "notice" && "bg-[#EEF2F7] border-[#E2E8F0] text-[#0F172A]",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="bg-[#166534] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 tracking-wider">
            Notice
          </span>
          <div className="text-xs sm:text-sm font-medium truncate text-[#0F172A]">
            {message}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {actionText && actionHref && (
            <Link
              href={actionHref}
              className="text-[#166534] font-semibold underline underline-offset-2 hover:text-[#14532D] text-xs inline-flex items-center gap-1"
            >
              <span>{actionText}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="text-[#64748B] hover:text-[#0F172A] p-0.5 rounded transition-colors"
              aria-label="Dismiss notice"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
