import React from "react";
import Link from "next/link";
import { ChallengeListItem } from "../types/challenge.types";
import { ChallengeStatusBadge } from "./ChallengeStatusBadge";

interface ChallengeCardProps {
  challenge: ChallengeListItem;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  return (
    <div className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
            {challenge.category}
          </span>
          <ChallengeStatusBadge status={challenge.status} />
        </div>

        <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
          <Link href={`/challenges/${challenge.id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {challenge.title}
          </Link>
        </h3>

        <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4">
          {challenge.district && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {challenge.district}, {challenge.state || ""}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            ~{challenge.affected_population.toLocaleString()} affected
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs text-zinc-500">
        <span>{new Date(challenge.created_at).toLocaleDateString()}</span>
        {challenge.assets_count > 0 && (
          <span className="flex items-center gap-1 text-zinc-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {challenge.assets_count} evidence files
          </span>
        )}
      </div>
    </div>
  );
};
