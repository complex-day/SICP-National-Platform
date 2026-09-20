"use client";

import React from "react";
import { DIRITier } from "../types/governance.types";
import { Award, Zap, Target } from "lucide-react";

interface Props {
  tier: DIRITier;
  score?: number;
}

export function DIRITierBadge({ tier, score }: Props) {
  switch (tier) {
    case "TIER_1_EXCELLENCE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <Award className="h-3 w-3" />
          <span>Tier 1: Excellence</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "TIER_2_PROGRESSIVE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
          <Zap className="h-3 w-3" />
          <span>Tier 2: Progressive</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "TIER_3_ASPIRATIONAL":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
          <Target className="h-3 w-3" />
          <span>Tier 3: Aspirational</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    default:
      return (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {tier}
        </span>
      );
  }
}
