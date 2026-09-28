"use client";

import React from "react";
import { SRITier } from "../types/governance.types";
import { ShieldCheck, ShieldAlert, Award } from "lucide-react";

interface Props {
  tier: SRITier;
  score?: number;
}

export function SRITierBadge({ tier, score }: Props) {
  switch (tier) {
    case "TIER_1_AAA":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#166534] border border-emerald-300 shadow-2xs">
          <ShieldCheck className="h-3 w-3" />
          <span>Tier 1 (AAA)</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "TIER_2_AA":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs">
          <Award className="h-3 w-3" />
          <span>Tier 2 (AA)</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "TIER_3_A":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
          <ShieldAlert className="h-3 w-3" />
          <span>Tier 3 (A)</span>
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
