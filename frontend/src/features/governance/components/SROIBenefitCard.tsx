"use client";

import React from "react";
import { ProjectSROIReport } from "../types/governance.types";
import { TrendingUp, IndianRupee, Users, ShieldCheck, Award } from "lucide-react";

interface Props {
  report: ProjectSROIReport;
}

export function SROIBenefitCard({ report }: Props) {
  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-border flex flex-col justify-between hover:border-emerald-500/40 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border">
            {report.domainCategory}
          </span>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {report.sroiRatio}x SROI
          </span>
        </div>

        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {report.projectTitle}
        </h4>

        <div className="text-xs text-muted-foreground mb-3">
          {report.institutionName} • {report.districtName}, {report.stateName}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-muted/40 p-2 rounded-lg border border-border/40">
            <div className="text-[10px] text-muted-foreground uppercase">
              Capital Invested
            </div>
            <div className="font-bold text-foreground mt-0.5">
              {formatLakhs(report.capitalInvested)}
            </div>
          </div>

          <div className="bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400 uppercase font-semibold">
              Net Societal Value
            </div>
            <div className="font-bold text-emerald-400 mt-0.5">
              {formatLakhs(report.netPresentSocietalValue)}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-primary" />
          {report.verifiedBeneficiaries.toLocaleString("en-IN")} Citizens
        </span>

        <span className="text-xs font-semibold text-foreground flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          PSI {report.psiScore}/100
        </span>
      </div>
    </div>
  );
}
