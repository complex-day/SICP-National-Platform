"use client";

import React from "react";
import { DistrictDIRIScorecard } from "../types/governance.types";
import { DIRITierBadge } from "./DIRITierBadge";
import {
  X,
  MapPin,
  Award,
  TrendingUp,
  Users,
  FolderGit2,
  IndianRupee,
  CheckCircle2,
  Sparkles,
  BarChart2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  district: DistrictDIRIScorecard | null;
}

export function DistrictScorecardModal({ isOpen, onClose, district }: Props) {
  if (!isOpen || !district) return null;

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <MapPin className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-base">
                  {district.districtName} District Scorecard
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  ({district.districtCode})
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {district.stateName} • National Rank #{district.ranking}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main DIRI Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                District Innovation & Resolution Index
              </span>
              <div className="text-3xl font-black text-foreground mt-0.5">
                {district.diriScore}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ 100.0</span>
              </div>
            </div>

            <DIRITierBadge tier={district.tier} />
          </div>

          {/* DIRI Mathematical Factor Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-primary" />
              <span>DIRI Index Mathematical Weights</span>
            </h4>

            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    1. Problem Resolution Rate (40% Weight)
                  </span>
                  <span className="font-bold text-foreground">{district.resolutionRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${district.resolutionRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    2. Student Team Density Score (30% Weight)
                  </span>
                  <span className="font-bold text-foreground">
                    {district.activeStudentTeams} Teams
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, district.activeStudentTeams * 2)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    3. CSR Sponsorship Coverage (20% Weight)
                  </span>
                  <span className="font-bold text-foreground">
                    {formatLakhs(district.totalCSRCommitted)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `85%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase">Challenges</span>
              <div className="font-bold text-foreground mt-0.5">
                {district.totalChallenges} Total ({district.resolvedChallenges} Resolved)
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase">Active R&D Projects</span>
              <div className="font-bold text-foreground mt-0.5">{district.activeProjects} Projects</div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase">Beneficiaries</span>
              <div className="font-bold text-emerald-400 mt-0.5">
                {district.verifiedBeneficiaries.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Top Focus Domain */}
          <div className="p-3 bg-muted/30 rounded-xl border border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Highest Velocity Domain:</span>
            <span className="font-semibold text-primary">{district.topDomain}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex justify-end bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted text-xs font-semibold border border-border transition-colors"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
