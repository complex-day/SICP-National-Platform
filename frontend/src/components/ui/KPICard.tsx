"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number | string;
    direction: "up" | "down" | "neutral";
    label?: string;
    isPositive?: boolean; // If true, up is good; if false, up is bad (e.g. error rates)
  };
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: "brand" | "emerald" | "amber" | "rose" | "purple" | "blue";
  tooltip?: string;
  className?: string;
  isLoading?: boolean;
}

const accentStyles = {
  brand: {
    iconBg: "bg-primary/10 text-primary border-primary/20",
    glow: "hover:border-primary/50",
    borderTop: "border-t-primary",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    glow: "hover:border-emerald-500/50",
    borderTop: "border-t-emerald-500",
  },
  amber: {
    iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    glow: "hover:border-amber-500/50",
    borderTop: "border-t-amber-500",
  },
  rose: {
    iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    glow: "hover:border-rose-500/50",
    borderTop: "border-t-rose-500",
  },
  purple: {
    iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    glow: "hover:border-purple-500/50",
    borderTop: "border-t-purple-500",
  },
  blue: {
    iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    glow: "hover:border-blue-500/50",
    borderTop: "border-t-blue-500",
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  accentColor = "brand",
  tooltip,
  className,
  isLoading = false,
}: KPICardProps) {
  const accent = accentStyles[accentColor] || accentStyles.brand;

  if (isLoading) {
    return (
      <div
        className={cn(
          "glass-panel rounded-xl p-5 relative overflow-hidden animate-pulse border-border",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="h-4 w-28 bg-muted rounded"></div>
          <div className="h-9 w-9 bg-muted rounded-lg"></div>
        </div>
        <div className="h-8 w-36 bg-muted rounded mb-2"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  // Determine trend color
  const isUp = trend?.direction === "up";
  const isDown = trend?.direction === "down";
  const isPositive = trend?.isPositive ?? isUp;

  return (
    <div
      title={tooltip}
      className={cn(
        "glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-200",
        accent.glow,
        "border-t-2",
        accent.borderTop,
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
              accent.iconBg
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
              trend.direction === "neutral"
                ? "bg-muted text-muted-foreground border-border"
                : isPositive
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}
          >
            {isUp && <TrendingUp className="h-3 w-3" />}
            {isDown && <TrendingDown className="h-3 w-3" />}
            {!isUp && !isDown && <Minus className="h-3 w-3" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {(subtitle || trend?.label) && (
        <p className="text-xs text-muted-foreground truncate">
          {subtitle || trend?.label}
        </p>
      )}
    </div>
  );
}
