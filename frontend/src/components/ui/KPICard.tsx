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
    isPositive?: boolean;
  };
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: "brand" | "emerald" | "amber" | "rose" | "purple" | "blue";
  tooltip?: string;
  className?: string;
  isLoading?: boolean;
}

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
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs animate-pulse",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="h-4 w-28 bg-slate-200 rounded"></div>
          <div className="h-8 w-8 bg-slate-200 rounded"></div>
        </div>
        <div className="h-8 w-36 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-20 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const isUp = trend?.direction === "up";
  const isDown = trend?.direction === "down";
  const isPositive = trend?.isPositive ?? isUp;

  return (
    <div
      title={tooltip}
      className={cn(
        "bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs flex flex-col justify-between transition-colors hover:border-[#166534]/50",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#475569] truncate">
          {title}
        </span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
          {value}
        </span>

        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border",
              trend.direction === "neutral"
                ? "bg-slate-100 text-[#475569] border-slate-200"
                : isPositive
                ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
                : "bg-red-50 text-[#DC2626] border-red-200"
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
        <p className="text-xs text-[#64748B] truncate">
          {subtitle || trend?.label}
        </p>
      )}
    </div>
  );
}
