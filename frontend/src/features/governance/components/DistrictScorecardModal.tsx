"use client";

import React from "react";
import { DistrictDIRIScorecard } from "../types/governance.types";
import { DIRITierBadge } from "./DIRITierBadge";
import {
  X,
  MapPin,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#166534]">
              <MapPin className="w-5 h-5 text-[#DC2626]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#0F172A] text-base">
                  {district.districtName} District Scorecard
                </h3>
                <span className="text-xs text-[#64748B] font-mono font-semibold">
                  ({district.districtCode})
                </span>
              </div>
              <p className="text-xs text-[#475569]">
                {district.stateName} • National Rank #{district.ranking}
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
          {/* Main DIRI Banner */}
          <div className="p-4 rounded-xl bg-[#EEF2F7] border border-[#CBD5E1] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                District Innovation & Resolution Index
              </span>
              <div className="text-3xl font-extrabold text-[#166534] mt-0.5">
                {district.diriScore}{" "}
                <span className="text-xs font-semibold text-[#64748B]">/ 100.0</span>
              </div>
            </div>

            <DIRITierBadge tier={district.tier} />
          </div>

          {/* DIRI Mathematical Factor Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-[#166534]" />
              <span>DIRI Index Mathematical Weights</span>
            </h4>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#475569] font-medium">
                    1. Problem Resolution Rate (40% Weight)
                  </span>
                  <span className="font-bold text-[#0F172A]">{district.resolutionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full bg-[#166534] rounded-full"
                    style={{ width: `${district.resolutionRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#475569] font-medium">
                    2. Student Team Density Score (30% Weight)
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {district.activeStudentTeams} Teams
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full bg-[#16A34A] rounded-full"
                    style={{ width: `${Math.min(100, district.activeStudentTeams * 2)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#475569] font-medium">
                    3. CSR Sponsorship Coverage (20% Weight)
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {formatLakhs(district.totalCSRCommitted)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div className="h-full bg-[#D97706] rounded-full" style={{ width: `85%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Challenges</span>
              <div className="font-bold text-[#0F172A] mt-0.5">
                {district.totalChallenges} Total ({district.resolvedChallenges} Resolved)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Active R&D Projects</span>
              <div className="font-bold text-[#0F172A] mt-0.5">{district.activeProjects} Projects</div>
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Beneficiaries</span>
              <div className="font-bold text-[#166534] mt-0.5">
                {district.verifiedBeneficiaries.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Top Focus Domain */}
          <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#475569] font-medium">Highest Velocity Domain:</span>
            <span className="font-bold text-[#166534] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              {district.topDomain}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] flex justify-end bg-[#EEF2F7]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold shadow-xs transition-colors"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
