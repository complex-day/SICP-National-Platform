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
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#166534] border border-emerald-300 shadow-2xs">
          <Crown className="h-3 w-3" />
          <span>Platinum</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "GOLD":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
          <Medal className="h-3 w-3" />
          <span>Gold</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "SILVER":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
          <Award className="h-3 w-3" />
          <span>Silver</span>
          {score !== undefined && <span className="ml-1 opacity-80">({score})</span>}
        </span>
      );
    case "BRONZE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-300 shadow-2xs">
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
