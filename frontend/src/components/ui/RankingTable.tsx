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
  if (!tier) return "bg-muted text-muted-foreground border-border";
  const normalized = tier.toUpperCase();
  if (normalized.includes("PLATINUM") || normalized.includes("TIER_1")) {
    return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
  }
  if (normalized.includes("GOLD") || normalized.includes("TIER_2")) {
    return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }
  if (normalized.includes("SILVER") || normalized.includes("TIER_3")) {
    return "bg-slate-300/10 text-slate-300 border-slate-400/30";
  }
  if (normalized.includes("RISK") || normalized.includes("EMERGING")) {
    return "bg-rose-500/10 text-rose-400 border-rose-500/30";
  }
  return "bg-primary/10 text-primary border-primary/20";
};

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 text-xs">
        <Award className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-300/20 text-slate-300 font-bold border border-slate-300/40 text-xs">
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
    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-muted/60 text-muted-foreground font-medium text-xs">
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
      <div className={cn("glass-panel rounded-xl p-5 animate-pulse", className)}>
        {title && <div className="h-5 w-40 bg-muted rounded mb-4"></div>}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted/40 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass-panel rounded-xl p-5 flex flex-col", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No ranking records available.
        </div>
      ) : (
        <div className="space-y-2 divide-y divide-border/40">
          {items.map((item) => {
            const scorePct = Math.min(100, Math.max(0, (item.score / maxScore) * 100));

            return (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  "flex items-center justify-between gap-3 pt-2.5 pb-1 first:pt-0 rounded-lg px-2 -mx-2 transition-colors",
                  onItemClick ? "cursor-pointer hover:bg-muted/40" : ""
                )}
              >
                {/* Rank & Identity */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getRankBadge(item.rank)}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">
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
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score & Progress */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right min-w-[70px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-sm font-bold text-foreground font-mono">
                        {item.score.toFixed(1)}
                      </span>
                      {item.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                      {item.trend === "down" && <TrendingDown className="h-3 w-3 text-rose-500" />}
                      {item.trend === "same" && <Minus className="h-3 w-3 text-muted-foreground" />}
                    </div>

                    <div className="w-20 bg-muted/60 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          scorePct >= 80 ? "bg-emerald-500" : scorePct >= 60 ? "bg-primary" : "bg-amber-500"
                        )}
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                  </div>

                  {item.secondaryMetric && (
                    <div className="hidden sm:block text-right min-w-[80px]">
                      <span className="text-xs font-semibold text-foreground">
                        {item.secondaryMetric.value}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {item.secondaryMetric.label}
                      </p>
                    </div>
                  )}

                  {onItemClick && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
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
