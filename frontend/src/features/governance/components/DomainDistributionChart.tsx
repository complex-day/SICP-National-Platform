"use client";

import React from "react";
import { DomainDistribution } from "../types/governance.types";
import {
  Droplets,
  Sprout,
  SunMedium,
  HeartPulse,
  Building,
  Trash2,
  TrendingUp,
  Users,
  IndianRupee,
} from "lucide-react";

interface Props {
  domains: DomainDistribution[];
}

const domainIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  "Water Conservation": Droplets,
  Agriculture: Sprout,
  "Clean Energy": SunMedium,
  Healthcare: HeartPulse,
  Infrastructure: Building,
  "Waste Management": Trash2,
};

export function DomainDistributionChart({ domains }: Props) {
  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Domain Distribution & Impact Analytics
          </h3>
          <p className="text-xs text-muted-foreground">
            Cross-sectoral breakdown of citizen challenges, R&D innovations, CSR allocation, and SROI yields
          </p>
        </div>

        <span className="text-xs font-semibold text-muted-foreground">
          6 Strategic Focus Areas
        </span>
      </div>

      {/* Multi-color unified progress bar */}
      <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-muted">
        {domains.map((d) => (
          <div
            key={d.category}
            title={`${d.category}: ${d.percentageShare}%`}
            className="h-full transition-all duration-300 hover:opacity-90"
            style={{
              width: `${d.percentageShare}%`,
              backgroundColor: d.color,
            }}
          />
        ))}
      </div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {domains.map((d) => {
          const Icon = domainIcons[d.category] || Droplets;

          return (
            <div
              key={d.category}
              className="p-4 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg border flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${d.color}15`,
                        borderColor: `${d.color}40`,
                        color: d.color,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                      {d.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {d.percentageShare}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mt-3">
                  <div className="bg-background/60 p-2 rounded-lg border border-border/40">
                    <div className="text-muted-foreground text-[10px] uppercase">
                      Challenges
                    </div>
                    <div className="font-bold text-foreground">
                      {d.challengesCount} ({d.activeProjectsCount} Proj)
                    </div>
                  </div>

                  <div className="bg-background/60 p-2 rounded-lg border border-border/40">
                    <div className="text-muted-foreground text-[10px] uppercase">
                      CSR Capital
                    </div>
                    <div className="font-bold text-foreground font-mono">
                      {formatLakhs(d.csrCapitalAllocated)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] mt-3">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3 text-emerald-500" />
                  {d.verifiedBeneficiaries.toLocaleString("en-IN")} reach
                </span>

                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {d.sroiRatio}x SROI
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
