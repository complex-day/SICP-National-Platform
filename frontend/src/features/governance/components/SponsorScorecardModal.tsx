"use client";

import React, { useState } from "react";
import { SponsorSRIScorecard } from "../types/governance.types";
import { SRITierBadge } from "./SRITierBadge";
import { governanceService } from "@/services/governance.service";
import {
  X,
  Building2,
  Download,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#166534]">
              <Building2 className="w-5 h-5 text-[#166534]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#0F172A] text-base line-clamp-1">
                  {sponsor.companyName}
                </h3>
              </div>
              <p className="text-xs text-[#475569]">
                National SRI Rank #{sponsor.ranking} • {sponsor.complianceRating}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main SRI Banner */}
          <div className="p-4 rounded-xl bg-[#EEF2F7] border border-[#CBD5E1] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                Sponsor Reliability Index (SRI)
              </span>
              <div className="text-3xl font-extrabold text-[#166534] mt-0.5">
                {sponsor.sriScore}{" "}
                <span className="text-xs font-semibold text-[#64748B]">/ 100.0</span>
              </div>
            </div>

            <SRITierBadge tier={sponsor.tier} />
          </div>

          {/* SRI Algorithmic Weights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-[#166534]" />
              <span>SRI Reliability & Compliance Metrics</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  1. Capital Fulfillment Rate (40%)
                </div>
                <div className="font-bold text-[#166534] mt-0.5">
                  {sponsor.utilizationPercentage}% Disbursed
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  2. Tranche Timeliness (30%)
                </div>
                <div className="font-bold text-[#0F172A] mt-0.5">
                  {sponsor.onTimeDisbursementsCount}/{sponsor.scheduledTranchesCount} On-Time
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  3. Technical Advisory Depth (10%)
                </div>
                <div className="font-bold text-[#0369A1] mt-0.5">
                  {sponsor.mentorshipHoursDelivered} Hours Delivered
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  4. Active Sponsorships (20%)
                </div>
                <div className="font-bold text-[#0F172A] mt-0.5">
                  {sponsor.activeProjectsSponsored} Active Projects
                </div>
              </div>
            </div>
          </div>

          {/* Capital Allocation Card */}
          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#64748B] font-medium block text-[11px]">
                Total Committed Capital:
              </span>
              <span className="font-mono font-bold text-[#0F172A] text-sm">
                {formatLakhs(sponsor.committedFunds)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#64748B] font-medium block text-[11px]">
                Total Released / Audited:
              </span>
              <span className="font-mono font-bold text-[#166534] text-sm">
                {formatLakhs(sponsor.releasedFunds)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold shadow-xs transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleExportMCA}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] transition-all flex items-center gap-1.5 shadow-xs"
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
