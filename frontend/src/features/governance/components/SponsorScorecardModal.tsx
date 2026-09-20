"use client";

import React, { useState } from "react";
import { SponsorSRIScorecard } from "../types/governance.types";
import { SRITierBadge } from "./SRITierBadge";
import { governanceService } from "@/services/governance.service";
import {
  X,
  Building2,
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  IndianRupee,
  Clock,
  Sparkles,
  BarChart2,
  Loader2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorSRIScorecard | null;
  onExportSuccess?: (message: string) => void;
}

export function SponsorScorecardModal({
  isOpen,
  onClose,
  sponsor,
  onExportSuccess,
}: Props) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !sponsor) return null;

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  const handleExportMCA = async () => {
    try {
      setIsExporting(true);
      const res = await governanceService.exportMcaCsrPackage(sponsor.partnerId);
      if (onExportSuccess) {
        onExportSuccess(
          `MCA CSR-1 Compliance Certificate (${res.certificateNumber}) exported for ${sponsor.companyName}!`
        );
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-base line-clamp-1">
                  {sponsor.companyName}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                National SRI Rank #{sponsor.ranking} • {sponsor.complianceRating}
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
          {/* Main SRI Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sponsor Reliability Index (SRI)
              </span>
              <div className="text-3xl font-black text-foreground mt-0.5">
                {sponsor.sriScore}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ 100.0</span>
              </div>
            </div>

            <SRITierBadge tier={sponsor.tier} />
          </div>

          {/* SRI Algorithmic Weights */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-emerald-400" />
              <span>SRI Reliability & Compliance Metrics</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  1. Capital Fulfillment Rate (40%)
                </div>
                <div className="font-bold text-emerald-400 mt-0.5">
                  {sponsor.utilizationPercentage}% Disbursed
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  2. Tranche Timeliness (30%)
                </div>
                <div className="font-bold text-foreground mt-0.5">
                  {sponsor.onTimeDisbursementsCount}/{sponsor.scheduledTranchesCount} On-Time
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  3. Technical Advisory Depth (10%)
                </div>
                <div className="font-bold text-primary mt-0.5">
                  {sponsor.mentorshipHoursDelivered} Hours Delivered
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  4. Active Sponsorships (20%)
                </div>
                <div className="font-bold text-foreground mt-0.5">
                  {sponsor.activeProjectsSponsored} Active Projects
                </div>
              </div>
            </div>
          </div>

          {/* Capital Allocation Card */}
          <div className="p-3.5 bg-muted/30 rounded-xl border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Total Committed Capital:
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {formatLakhs(sponsor.committedFunds)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Total Released / Audited:
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatLakhs(sponsor.releasedFunds)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted text-xs font-semibold border border-border transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleExportMCA}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-sm"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export MCA CSR-1 Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
