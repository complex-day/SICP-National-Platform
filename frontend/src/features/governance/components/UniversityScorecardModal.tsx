"use client";

import React, { useState } from "react";
import { UniversityUPIScorecard } from "../types/governance.types";
import { UPITierBadge } from "./UPITierBadge";
import { governanceService } from "@/services/governance.service";
import {
  X,
  GraduationCap,
  Award,
  Users,
  FolderGit2,
  Download,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Loader2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  university: UniversityUPIScorecard | null;
  onExportSuccess?: (message: string) => void;
}

export function UniversityScorecardModal({
  isOpen,
  onClose,
  university,
  onExportSuccess,
}: Props) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !university) return null;

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  const handleExportEvidence = async () => {
    try {
      setIsExporting(true);
      const res = await governanceService.exportNaacNirfPackage(university.universityId);
      if (onExportSuccess) {
        onExportSuccess(
          `NAAC/NIRF Evidence Dossier (${res.dossierId}) exported successfully for ${university.universityName}!`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#0F172A] text-base line-clamp-1">
                  {university.universityName}
                </h3>
              </div>
              <p className="text-xs text-[#475569]">
                {university.stateName} • National UPI Rank #{university.ranking} • {university.accreditationGrade}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white">
          {/* Main UPI Banner */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                University Participation Index (UPI)
              </span>
              <div className="text-3xl font-bold text-[#0F172A] mt-0.5 font-mono">
                {university.upiScore}{" "}
                <span className="text-xs font-normal text-[#64748B]">/ 100.0</span>
              </div>
            </div>

            <UPITierBadge tier={university.tier} />
          </div>

          {/* UPI Weight Dimensions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-[#166534]" />
              <span>UPI Performance Metric Components</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                  1. Claim Execution Rate
                </div>
                <div className="font-bold text-[#0F172A] mt-0.5">
                  {university.claimedChallenges} Claimed ({university.allocatedTeams} Teams)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                  2. Milestone Velocity
                </div>
                <div className="font-bold text-[#16A34A] mt-0.5">
                  {university.approvedMilestones} Milestones Approved
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                  3. Faculty Mentorship Depth
                </div>
                <div className="font-bold text-[#0F172A] mt-0.5">
                  {university.activeFacultyMentors} Active PIs
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                  4. Patents & Commercialization
                </div>
                <div className="font-bold text-[#166534] mt-0.5">
                  {university.patentsFiled} Patents Filed
                </div>
              </div>
            </div>
          </div>

          {/* Funding Secured Banner */}
          <div className="p-3.5 bg-[#EEF2F7] rounded-lg border border-[#E2E8F0] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#64748B] block text-[11px] font-medium">
                Total CSR & Grant Funding Secured:
              </span>
              <span className="font-mono font-bold text-[#0F172A] text-sm">
                {formatLakhs(university.totalFundingSecured)}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#166534] border border-emerald-200 text-xs font-semibold">
              {university.activeProjects} Active R&D Projects
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-[#475569] hover:bg-slate-100 text-xs font-semibold border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleExportEvidence}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export NAAC / NIRF Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
