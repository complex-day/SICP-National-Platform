"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChallengeListItem, ChallengeFilters as FilterType } from "@/features/challenge/types/challenge.types";
import { ChallengeCard } from "@/features/challenge/components/ChallengeCard";
import { ChallengeFilters } from "@/features/challenge/components/ChallengeFilters";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";

export default function ChallengesCatalogPage() {
  const token = useAuthStore((state) => state.token);
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterType>({ page: 1, limit: 12 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChallenges() {
      try {
        setIsLoading(true);
        const res = await challengeService.listChallenges(filters, token);
        setChallenges(res.items);
        setTotal(res.pagination.total);
      } catch (err) {
        console.error("Failed to load challenges:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenges();
  }, [filters, token]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              Societal <span className="text-emerald-400">Innovation Challenges</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Explore grassroots community challenges seeking academic problem-solvers, student innovators, and CSR sponsors.
            </p>
          </div>
          <Link
            href="/citizen/create-challenge"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
          >
            Submit a Challenge
          </Link>
        </div>

        {/* Filters */}
        <ChallengeFilters filters={filters} onChange={setFilters} />

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Showing {challenges.length} of {total} challenges</span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-zinc-500">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            Loading challenges catalog...
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center text-zinc-400 space-y-3">
            <p className="text-base font-semibold text-zinc-300">No challenges found matching your criteria</p>
            <p className="text-xs text-zinc-500">Try adjusting your search keywords or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
