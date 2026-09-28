"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  percentage?: number; // 0 to 100
  targetLabel?: string;
  category?: string;
  statusColor?: "emerald" | "amber" | "rose" | "blue" | "purple";
  footerNote?: string;
  className?: string;
  isLoading?: boolean;
}

const statusColorMap = {
  emerald: {
    bar: "bg-[#16A34A]",
    badge: "bg-emerald-50 text-[#166534] border-emerald-200",
  },
  amber: {
    bar: "bg-[#D97706]",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  rose: {
    bar: "bg-[#DC2626]",
    badge: "bg-red-50 text-red-800 border-red-200",
  },
  blue: {
    bar: "bg-[#0369A1]",
    badge: "bg-sky-50 text-[#0369A1] border-sky-200",
  },
  purple: {
    bar: "bg-[#166534]",
    badge: "bg-emerald-50 text-[#166534] border-emerald-200",
  },
};

export function MetricCard({
  label,
  value,
  percentage,
  targetLabel,
  category,
  statusColor = "emerald",
  footerNote,
  className,
  isLoading = false,
}: MetricCardProps) {
  const colors = statusColorMap[statusColor] || statusColorMap.emerald;

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-lg p-4 border border-[#E2E8F0] shadow-xs animate-pulse", className)}>
        <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
        <div className="h-6 w-28 bg-slate-200 rounded mb-3"></div>
        <div className="h-2 w-full bg-slate-200 rounded"></div>
      </div>
    );
  }

  const clampedPercentage = percentage !== undefined ? Math.min(100, Math.max(0, percentage)) : undefined;

  return (
    <div
      className={cn(
        "bg-white rounded-lg p-4 border border-[#E2E8F0] shadow-xs hover:border-[#166534]/50 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs text-[#475569] font-medium truncate">
          {label}
        </span>
        {category && (
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
              colors.badge
            )}
          >
            {category}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="text-xl font-bold tracking-tight text-[#0F172A]">
          {value}
        </span>
        {targetLabel && (
          <span className="text-xs text-[#64748B] font-medium">
            {targetLabel}
          </span>
        )}
      </div>

      {clampedPercentage !== undefined && (
        <div className="w-full bg-[#EEF2F7] rounded-full h-1.5 overflow-hidden mb-1.5">
          <div
            className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      )}

      {footerNote && (
        <p className="text-[11px] text-[#64748B] mt-1 truncate">
          {footerNote}
        </p>
      )}
    </div>
  );
}
