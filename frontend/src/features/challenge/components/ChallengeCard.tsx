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
        "glass-panel rounded-2xl border border-border/80 p-5 sm:p-6 flex flex-col justify-between hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden",
        className
      )}
    >
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              {challenge.category}
            </span>
            <ChallengeUrgencyBadge urgency={challenge.urgency} showIcon={false} />
          </div>
          <ChallengeStatusBadge status={challenge.status} />
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug capitalize">
          <Link href={`/challenges/${challenge.id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {challenge.title}
          </Link>
        </h3>

        {/* Description preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {challenge.description}
        </p>

        {/* Location & Impact Meta */}
        <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate font-medium text-foreground/80">
              {district ? `${district}${state ? `, ${state}` : ""}` : "District unassigned"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            <span>
              ~<strong className="text-foreground font-semibold">{affected.toLocaleString()}</strong> affected citizens
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
          </div>

          {mediaCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
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
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background/80 hover:bg-primary/10 text-foreground border-border hover:border-primary/30"
            )}
            title="Upvote this challenge"
          >
            <ThumbsUp className={cn("h-3.5 w-3.5", isUpvoted && "fill-current")} />
            <span>{upvotes}</span>
          </button>

          <Link
            href={`/challenges/${challenge.id}`}
            className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors z-20"
            title="View Details"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
