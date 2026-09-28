import React, { useState } from "react";
import Link from "next/link";
import { Challenge } from "@/features/challenges/types/challenge.types";
import { ChallengeStatusBadge } from "./ChallengeStatusBadge";
import { ChallengeUrgencyBadge } from "./ChallengeUrgencyBadge";
import { MapPin, Users, ThumbsUp, Calendar, ArrowUpRight, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { challengeService } from "@/services/challenge.service";

interface ChallengeCardProps {
  challenge: Challenge;
  onUpvoteChange?: (id: string, newCount: number) => void;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onUpvoteChange,
  className,
}) => {
  const [upvotes, setUpvotes] = useState(challenge.upvotes || 0);
  const [isUpvoted, setIsUpvoted] = useState(challenge.isUpvoted || false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpvoting) return;

    try {
      setIsUpvoting(true);
      const res = await challengeService.upvoteChallenge(challenge.id);
      setUpvotes(res.upvotes);
      setIsUpvoted(res.isUpvoted);
      onUpvoteChange?.(challenge.id, res.upvotes);
    } catch (err) {
      console.error("Upvote failed:", err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const district = challenge.location?.district;
  const state = challenge.location?.state;
  const affected = challenge.affectedPopulation || 0;
  const mediaCount = challenge.media?.length || 0;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 flex flex-col justify-between hover:border-[#CBD5E1] transition-all duration-200 group relative overflow-hidden",
        className
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#166534] border border-emerald-200 text-xs font-bold">
              {challenge.category}
            </span>
            <ChallengeUrgencyBadge urgency={challenge.urgency} showIcon={false} />
          </div>
          <ChallengeStatusBadge status={challenge.status} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#166534] transition-colors line-clamp-2 mb-2 leading-snug capitalize">
          <Link href={`/academic/challenges`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {challenge.title}
          </Link>
        </h3>

        {/* Description preview */}
        <p className="text-xs text-[#475569] line-clamp-2 mb-4 leading-relaxed">
          {challenge.description}
        </p>

        {/* Location & Impact Meta */}
        <div className="space-y-1.5 text-xs text-[#64748B] mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#166534] shrink-0" />
            <span className="truncate font-medium text-[#0F172A]">
              {district ? `${district}${state ? `, ${state}` : ""}` : "District unassigned"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#0369A1] shrink-0" />
            <span>
              ~<strong className="text-[#0F172A] font-semibold">{affected.toLocaleString()}</strong> affected citizens
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
          </div>

          {mediaCount > 0 && (
            <div className="flex items-center gap-1 text-[#64748B]">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{mediaCount} files</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer z-20",
              isUpvoted
                ? "bg-[#166534] text-white border-[#166534] shadow-xs"
                : "bg-white hover:bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] hover:border-[#166534]"
            )}
            title="Upvote this challenge"
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", isUpvoted && "fill-current")} />
            <span>{upvotes}</span>
          </button>

          <Link
            href={`/academic/challenges`}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#166534] hover:bg-[#F8FAFC] transition-colors z-20"
            title="View Details"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
