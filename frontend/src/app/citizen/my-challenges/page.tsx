"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChallengeListItem } from "@/features/challenge/types/challenge.types";
import { ChallengeStatusBadge } from "@/features/challenge/components/ChallengeStatusBadge";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";

export default function MyChallengesPage() {
  const token = useAuthStore((state) => state.token);
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyChallenges() {
      if (!token) return;
      try {
        setIsLoading(true);
        const result = await challengeService.listMyChallenges(1, 50, token);
        setChallenges(result.items);
      } catch (err: any) {
        setError(err.message || "Failed to load your challenges");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyChallenges();
  }, [token]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
              My <span className="text-emerald-400">Reported Challenges</span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Track the progress, evaluation, and lifecycle status of challenges you have submitted.
            </p>
          </div>
          <Link
            href="/citizen/create-challenge"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Report New Challenge
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center text-zinc-500">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            Loading your challenges...
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-200">No challenges reported yet</h3>
              <p className="text-xs text-zinc-400 mt-1">
                You haven&apos;t created any societal challenges yet. Start by reporting an issue in your local community.
              </p>
            </div>
            <Link
              href="/citizen/create-challenge"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              Submit Your First Challenge
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-xs uppercase text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Challenge Title</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Affected</th>
                    <th className="px-6 py-4 font-semibold">Created Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-200 max-w-xs truncate">
                        <Link href={`/challenges/${c.id}`} className="hover:text-emerald-400 transition-colors">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{c.category}</td>
                      <td className="px-6 py-4">
                        <ChallengeStatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-zinc-400">~{c.affected_population.toLocaleString()}</td>
                      <td className="px-6 py-4 text-zinc-500 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/challenges/${c.id}`}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          View Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
