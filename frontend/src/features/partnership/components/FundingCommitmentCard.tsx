"use client";

import React from "react";
import { Partnership } from "../types/partnership.types";
import { DollarSign, CheckCircle2, Clock, Wrench, ArrowRight } from "lucide-react";

interface Props {
  partnership: Partnership;
  onReleaseTrancheClick?: () => void;
}

export function FundingCommitmentCard({
  partnership,
  onReleaseTrancheClick,
}: Props) {
  const {
    totalCommittedFunding,
    totalReleasedFunding,
    equipmentSponsorshipValue,
    tranches,
  } = partnership;

  const utilizationPct =
    totalCommittedFunding > 0
      ? Math.round((totalReleasedFunding / totalCommittedFunding) * 100)
      : 0;

  const eligibleTranchesCount = tranches.filter((t) => t.status === "ELIGIBLE").length;

  return (
    <div className="p-6 rounded-2xl bg-card border border-border space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            CSR Capital Commitment
          </span>
          <h4 className="font-bold text-base text-foreground mt-0.5">
            ₹{(totalCommittedFunding / 100000).toFixed(1)} Lakhs Committed
          </h4>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block">Disbursed</span>
          <span className="font-mono font-bold text-sm text-emerald-400">
            ₹{(totalReleasedFunding / 100000).toFixed(1)}L ({utilizationPct}%)
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${utilizationPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Released: ₹{(totalReleasedFunding / 100000).toFixed(1)}L</span>
          <span>
            Pending: ₹{((totalCommittedFunding - totalReleasedFunding) / 100000).toFixed(1)}L
          </span>
        </div>
      </div>

      {/* Equipment Sponsorship Note */}
      {equipmentSponsorshipValue && equipmentSponsorshipValue > 0 && (
        <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-primary" />
            Equipment Grant:
          </span>
          <span className="font-mono font-bold text-foreground">
            +₹{(equipmentSponsorshipValue / 100000).toFixed(1)} Lakhs
          </span>
        </div>
      )}

      {/* Tranches Summary & Action */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          <span>{tranches.length} Scheduled Tranches</span>
          {eligibleTranchesCount > 0 && (
            <span className="text-amber-400 font-semibold block text-[11px]">
              {eligibleTranchesCount} Tranche Ready for Release
            </span>
          )}
        </div>

        {onReleaseTrancheClick && (
          <button
            onClick={onReleaseTrancheClick}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow-sm flex items-center gap-1.5 transition-all"
          >
            <span>Manage Tranches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
