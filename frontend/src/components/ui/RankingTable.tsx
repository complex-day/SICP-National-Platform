"use client";

import React from "react";
import { Award, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RankingItem {
  id: string | number;
  rank: number;
  title: string;
  subtitle?: string;
  score: number; // 0 to 100
  tier?: string;
  secondaryMetric?: {
    label: string;
    value: string | number;
  };
  trend?: "up" | "down" | "same";
}

interface RankingTableProps {
  title?: string;
  subtitle?: string;
  items: RankingItem[];
  maxScore?: number;
  onItemClick?: (item: RankingItem) => void;
  className?: string;
  isLoading?: boolean;
}

const getTierBadgeStyle = (tier?: string) => {
  if (!tier) return "bg-slate-100 text-[#475569] border-[#E2E8F0]";
  const normalized = tier.toUpperCase();
  if (normalized.includes("PLATINUM") || normalized.includes("TIER_1")) {
    return "bg-emerald-50 text-[#166534] border-emerald-200";
  }
  if (normalized.includes("GOLD") || normalized.includes("TIER_2")) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (normalized.includes("SILVER") || normalized.includes("TIER_3")) {
    return "bg-slate-100 text-slate-700 border-slate-300";
  }
  if (normalized.includes("RISK") || normalized.includes("EMERGING")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-emerald-50 text-[#166534] border-emerald-200";
};

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 text-[#166534] font-bold border border-emerald-300 text-xs">
        <Award className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-200 text-slate-700 font-bold border border-slate-300 text-xs">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 text-xs">
        3
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-[#64748B] font-medium text-xs">
      {rank}
    </span>
  );
};

export function RankingTable({
  title,
  subtitle,
  items,
  maxScore = 100,
  onItemClick,
  className,
  isLoading = false,
}: RankingTableProps) {
  if (isLoading) {
    return (
      <div className={cn("bg-white border border-[#E2E8F0] rounded-lg p-5 animate-pulse shadow-xs", className)}>
        {title && <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-[#E2E8F0] rounded-lg p-5 flex flex-col shadow-xs", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>}
          {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#64748B]">
          No ranking records available.
        </div>
      ) : (
        <div className="space-y-2 divide-y divide-[#E2E8F0]">
          {items.map((item) => {
            const scorePct = Math.min(100, Math.max(0, (item.score / maxScore) * 100));

            return (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  "flex items-center justify-between gap-3 pt-2.5 pb-1 first:pt-0 rounded-lg px-2 -mx-2 transition-colors",
                  onItemClick ? "cursor-pointer hover:bg-[#F8FAFC]" : ""
                )}
              >
                {/* Rank & Identity */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getRankBadge(item.rank)}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#0F172A] truncate">
                        {item.title}
                      </span>
                      {item.tier && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0",
                            getTierBadgeStyle(item.tier)
                          )}
                        >
                          {item.tier}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-[#64748B] truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score & Progress */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right min-w-[70px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-sm font-bold text-[#0F172A] font-mono">
                        {item.score.toFixed(1)}
                      </span>
                      {item.trend === "up" && <TrendingUp className="h-3 w-3 text-[#16A34A]" />}
                      {item.trend === "down" && <TrendingDown className="h-3 w-3 text-[#DC2626]" />}
                      {item.trend === "same" && <Minus className="h-3 w-3 text-[#64748B]" />}
                    </div>

                    <div className="w-20 bg-[#EEF2F7] rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          scorePct >= 80 ? "bg-[#16A34A]" : scorePct >= 60 ? "bg-[#166534]" : "bg-[#D97706]"
                        )}
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>

                  {item.secondaryMetric && (
                    <div className="hidden sm:block text-right min-w-[80px]">
                      <span className="text-xs font-semibold text-[#0F172A]">
                        {item.secondaryMetric.value}
                      </span>
                      <p className="text-[10px] text-[#64748B]">
                        {item.secondaryMetric.label}
                      </p>
                    </div>
                  )}

                  {onItemClick && (
                    <ChevronRight className="h-4 w-4 text-[#64748B] shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
