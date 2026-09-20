"use client";

import React from "react";
import { UPITier } from "../types/governance.types";
import { Crown, Medal, Award, Shield } from "lucide-react";

interface Props {
  tier: UPITier;
  score?: number;
}

export function UPITierBadge({ tier, score }: Props) {
  switch (tier) {
    case "PLATINUM":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
          <Crown className="h-3 w-3" />
          <span>Platinum</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "GOLD":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
          <Medal className="h-3 w-3" />
          <span>Gold</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "SILVER":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-400/10 text-slate-300 border border-slate-400/20 shadow-sm">
          <Award className="h-3 w-3" />
          <span>Silver</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "BRONZE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-700/10 text-amber-600 border border-amber-700/20 shadow-sm">
          <Shield className="h-3 w-3" />
          <span>Bronze</span>
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
