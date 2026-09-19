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
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  amber: {
    bar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  rose: {
    bar: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  },
  blue: {
    bar: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  purple: {
    bar: "bg-purple-500",
    badge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
};

export function MetricCard({
  label,
  value,
  percentage,
  targetLabel,
  category,
  statusColor = "blue",
  footerNote,
  className,
  isLoading = false,
}: MetricCardProps) {
  const colors = statusColorMap[statusColor] || statusColorMap.blue;

  if (isLoading) {
    return (
      <div className={cn("glass-panel rounded-lg p-4 animate-pulse", className)}>
        <div className="h-3 w-20 bg-muted rounded mb-2"></div>
        <div className="h-6 w-28 bg-muted rounded mb-3"></div>
        <div className="h-2 w-full bg-muted rounded"></div>
      </div>
    );
  }

  const clampedPercentage = percentage !== undefined ? Math.min(100, Math.max(0, percentage)) : undefined;

  return (
    <div
      className={cn(
        "glass-panel rounded-lg p-4 border border-border/70 hover:border-border transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs text-muted-foreground font-medium truncate">
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
        <span className="text-xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {targetLabel && (
          <span className="text-xs text-muted-foreground font-medium">
            {targetLabel}
          </span>
        )}
      </div>

      {clampedPercentage !== undefined && (
        <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden mb-1.5">
          <div
            className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      )}

      {footerNote && (
        <p className="text-[11px] text-muted-foreground mt-1 truncate">
          {footerNote}
        </p>
      )}
    </div>
  );
}
