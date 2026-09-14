"use client";

import React from "react";
import { ChallengeCategory, ChallengeFilters as FilterType } from "../types/challenge.types";

interface ChallengeFiltersProps {
  filters: FilterType;
  onChange: (newFilters: FilterType) => void;
}

const CATEGORIES: ChallengeCategory[] = [
  "Water",
  "Healthcare",
  "Agriculture",
  "Infrastructure",
  "Sanitation",
  "Education",
  "Environment",
  "Energy",
  "Accessibility",
  "Public Administration",
  "Rural Livelihood",
];

export const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({ filters, onChange }) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Search Challenges</label>
        <div className="relative">
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search by keywords, title, description..."
            className="w-full rounded-xl bg-zinc-900 border border-zinc-700 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <svg
            className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Pills */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2">Filter by Category</label>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, category: undefined, page: 1 })}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              !filters.category
                ? "bg-emerald-500 text-zinc-950 font-bold"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ ...filters, category: cat === filters.category ? undefined : cat, page: 1 })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filters.category === cat
                  ? "bg-emerald-500 text-zinc-950 font-bold"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
