"use client";

import React from "react";
import {
  CHALLENGE_CATEGORIES,
  CHALLENGE_STATUSES,
  ChallengeFiltersState,
} from "@/features/challenges/types/challenge.types";
import { Search, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeFiltersProps {
  filters: ChallengeFiltersState;
  onChange: (newFilters: ChallengeFiltersState) => void;
  availableStates?: string[];
  availableDistricts?: string[];
  className?: string;
}

export const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({
  filters,
  onChange,
  availableStates = [
    "All States",
    "Andhra Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Madhya Pradesh",
    "Maharashtra",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Tamil Nadu",
    "Telangana",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ],
  availableDistricts = [],
  className,
}) => {
  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim()) ||
      (filters.category && filters.category !== "ALL" && filters.category !== "All Categories") ||
      (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") ||
      (filters.state && filters.state !== "ALL" && filters.state !== "All States") ||
      (filters.district && filters.district !== "ALL" && filters.district !== "All Districts") ||
      filters.urgency ||
      filters.sortBy
  );

  const handleReset = () => {
    onChange({
      page: 1,
      limit: filters.limit || 50,
      search: "",
      category: undefined,
      status: undefined,
      state: undefined,
      district: undefined,
      urgency: undefined,
      sortBy: "newest",
    });
  };

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl border border-border/80 p-5 space-y-4 shadow-sm",
        className
      )}
    >
      {/* Search and Quick Actions Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search by keywords, title, problem, district, or state..."
            className="w-full rounded-xl bg-background border border-border pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, search: "", page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Dropdown */}
          <select
            value={filters.status || "ALL"}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value === "ALL" ? undefined : e.target.value,
                page: 1,
              })
            }
            className="rounded-xl bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {CHALLENGE_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* State Dropdown */}
          <select
            value={filters.state || "ALL"}
            onChange={(e) =>
              onChange({
                ...filters,
                state: e.target.value === "ALL" || e.target.value === "All States" ? undefined : e.target.value,
                district: undefined,
                page: 1,
              })
            }
            className="rounded-xl bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[150px] truncate"
          >
            <option value="ALL">All States</option>
            {availableStates.filter((s) => s !== "All States").map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* District Dropdown (if districts available) */}
          {availableDistricts.length > 0 && (
            <select
              value={filters.district || "ALL"}
              onChange={(e) =>
                onChange({
                  ...filters,
                  district: e.target.value === "ALL" ? undefined : e.target.value,
                  page: 1,
                })
              }
              className="rounded-xl bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <select
            value={filters.sortBy || "newest"}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as "newest" | "oldest" | "upvotes" | "affected",
                page: 1,
              })
            }
            className="rounded-xl bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="upvotes">Sort: Most Upvoted</option>
            <option value="affected">Sort: Most Affected</option>
            <option value="oldest">Sort: Oldest</option>
          </select>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => onChange({ ...filters, category: undefined, page: 1 })}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer",
              !filters.category || filters.category === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All Categories
          </button>
          {CHALLENGE_CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    category: isSelected ? undefined : cat,
                    page: 1,
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
