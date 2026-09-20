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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-base line-clamp-1">
                  {university.universityName}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {university.stateName} • National UPI Rank #{university.ranking} • {university.accreditationGrade}
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
          {/* Main UPI Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                University Participation Index (UPI)
              </span>
              <div className="text-3xl font-black text-foreground mt-0.5">
                {university.upiScore}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ 100.0</span>
              </div>
            </div>

            <UPITierBadge tier={university.tier} />
          </div>

          {/* UPI Weight Dimensions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-purple-400" />
              <span>UPI Performance Metric Components</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  1. Claim Execution Rate
                </div>
                <div className="font-bold text-foreground mt-0.5">
                  {university.claimedChallenges} Claimed ({university.allocatedTeams} Teams)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  2. Milestone Velocity
                </div>
                <div className="font-bold text-emerald-400 mt-0.5">
                  {university.approvedMilestones} Milestones Approved
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  3. Faculty Mentorship Depth
                </div>
                <div className="font-bold text-foreground mt-0.5">
                  {university.activeFacultyMentors} Active PIs
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase">
                  4. Patents & Commercialization
                </div>
                <div className="font-bold text-primary mt-0.5">
                  {university.patentsFiled} Patents Filed
                </div>
              </div>
            </div>
          </div>

          {/* Funding Secured Banner */}
          <div className="p-3.5 bg-muted/30 rounded-xl border border-border flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Total CSR & Grant Funding Secured:
              </span>
              <span className="font-mono font-bold text-foreground text-sm">
                {formatLakhs(university.totalFundingSecured)}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {university.activeProjects} Active R&D Projects
            </span>
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
            onClick={handleExportEvidence}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all flex items-center gap-1.5 shadow-sm"
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
