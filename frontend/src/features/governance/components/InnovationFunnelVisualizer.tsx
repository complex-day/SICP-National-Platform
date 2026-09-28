"use client";

import React from "react";
import { InnovationFunnelStage } from "../types/governance.types";
import {
  Flag,
  GraduationCap,
  Users,
  FolderGit2,
  Compass,
  Building2,
  Clock,
} from "lucide-react";

interface Props {
  stages: InnovationFunnelStage[];
}

const stageIcons = [
  Flag,
  GraduationCap,
  Users,
  FolderGit2,
  Compass,
  Building2,
];

export function InnovationFunnelVisualizer({ stages }: Props) {
  const maxCount = stages.length > 0 ? stages[0].count : 1;

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">
            National Innovation Pipeline & Funnel Velocity
          </h3>
          <p className="text-xs text-[#475569]">
            End-to-end lifecycle conversion from grassroots citizen challenges to commercial deployments
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#166534] border border-emerald-200 shrink-0">
          Overall Conversion: {((stages[stages.length - 1]?.count / maxCount) * 100).toFixed(1)}%
        </span>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const Icon = stageIcons[idx] || FolderGit2;
          const widthPct = Math.max(15, Math.round((stage.count / maxCount) * 100));

          return (
            <div key={stage.id} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-[#0F172A]">
                    Stage {idx + 1}: {stage.stageName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#0F172A] text-sm">
                    {stage.count.toLocaleString("en-IN")}
                  </span>
                  {idx > 0 && (
                    <span className="text-[11px] font-bold text-[#166534] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {stage.conversionRateFromPrevious}% conversion
                    </span>
                  )}
                  <span className="text-[10px] text-[#64748B] font-medium hidden sm:flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{stage.averageDurationDays}d avg
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-[#166534] transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              <p className="text-[11px] text-[#64748B] pl-7 line-clamp-1">
                {stage.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
