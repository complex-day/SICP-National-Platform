import React from "react";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  badge?: string;
}

export function KpiCard({
  label,
  value,
  trend,
  trendType = "neutral",
  subtitle,
  icon,
  className,
  badge,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-5 flex flex-col justify-between transition-colors hover:border-[#166534]/50",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#475569]">{label}</span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#166534]/10 text-[#166534] border border-[#166534]/20 uppercase">
            {badge}
          </span>
        )}
        {icon && !badge && <div className="text-[#166534] bg-[#EEF2F7] p-2 rounded-md">{icon}</div>}
      </div>

      <div className="mt-3">
        <div className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</div>
        {(trend || subtitle) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-semibold",
                  trendType === "positive" && "text-[#16A34A]",
                  trendType === "negative" && "text-[#DC2626]",
                  trendType === "neutral" && "text-[#64748B]"
                )}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="text-[#64748B]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
