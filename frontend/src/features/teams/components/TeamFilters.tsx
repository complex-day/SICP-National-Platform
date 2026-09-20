"use client";

import React from "react";
import {
  PRESET_SKILLS,
  TEAM_STATUSES,
  TeamFiltersState,
} from "@/features/teams/types/team.types";
import { Search, X, RotateCcw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamFiltersProps {
  filters: TeamFiltersState;
  onChange: (newFilters: TeamFiltersState) => void;
  className?: string;
}

export const TeamFilters: React.FC<TeamFiltersProps> = ({
  filters,
  onChange,
  className,
}) => {
  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim()) ||
      (filters.skill && filters.skill !== "ALL" && filters.skill !== "All Skills") ||
      (filters.status && filters.status !== "ALL" && filters.status !== "All Statuses") ||
      filters.hasOpenSlots ||
      filters.sortBy
  );

  const handleReset = () => {
    onChange({
      page: 1,
      limit: filters.limit || 50,
      search: "",
      skill: undefined,
      status: undefined,
      hasOpenSlots: false,
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
      {/* Search and Dropdowns Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search teams by name, challenge, leader, university, or skills..."
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
            {TEAM_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {/* Open Slots Filter Checkbox */}
          <button
            type="button"
            onClick={() => onChange({ ...filters, hasOpenSlots: !filters.hasOpenSlots, page: 1 })}
            className={cn(
              "px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5",
              filters.hasOpenSlots
                ? "bg-primary/15 text-primary border-primary/40"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span>Open Slots Only</span>
          </button>

          {/* Sort By */}
          <select
            value={filters.sortBy || "newest"}
            onChange={(e) =>
              onChange({
                ...filters,
                sortBy: e.target.value as "newest" | "members" | "progress" | "name",
                page: 1,
              })
            }
            className="rounded-xl bg-background border border-border px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="members">Sort: Most Members</option>
            <option value="progress">Sort: Highest Progress</option>
            <option value="name">Sort: Alphabetical</option>
          </select>

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

      {/* Skills Pills Bar */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => onChange({ ...filters, skill: undefined, page: 1 })}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer",
              !filters.skill || filters.skill === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All Skills
          </button>

          {PRESET_SKILLS.map((sk) => {
            const isSelected = filters.skill === sk;
            return (
              <button
                key={sk}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    skill: isSelected ? undefined : sk,
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
                {sk}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
