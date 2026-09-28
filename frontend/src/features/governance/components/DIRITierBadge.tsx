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
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#166534] border border-emerald-300 shadow-2xs">
          <Award className="h-3 w-3" />
          <span>Tier 1: Excellence</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "TIER_2_PROGRESSIVE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs">
          <Zap className="h-3 w-3" />
          <span>Tier 2: Progressive</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "TIER_3_ASPIRATIONAL":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
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
