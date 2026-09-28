"use client";

import React from "react";
import { ProjectAnalytics } from "../types/project.types";
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3,
  Flame,
} from "lucide-react";

interface Props {
  analytics: ProjectAnalytics;
  title?: string;
}

export function ProjectAnalyticsCard({
  analytics,
  title = "Project Velocity & Burn-Down Analytics",
}: Props) {
  const {
    completionPercentage,
    daysRemaining,
    totalMilestones,
    completedMilestones,
    pendingMilestones,
    burnDownData,
  } = analytics;

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-300">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#0F172A]">{title}</h3>
            <p className="text-xs text-[#64748B]">
              Planned vs. Actual Milestone Progress & Trajectory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-[#64748B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534]/30 inline-block" /> Planned
          </span>
          <span className="flex items-center gap-1 text-[#166534] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534] inline-block" /> Actual
          </span>
        </div>
      </div>

      {/* 3 Quick Stat Blocks */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center text-center">
          <span className="text-[11px] font-medium text-[#64748B]">
            Lifecycle Progress
          </span>
          <span className="text-xl font-bold font-mono text-[#166534] mt-1">
            {completionPercentage}%
          </span>
          <span className="text-[10px] text-[#64748B] mt-0.5">
            {completedMilestones} of {totalMilestones} Verified
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center text-center">
          <span className="text-[11px] font-medium text-[#64748B]">
            Schedule Runway
          </span>
          <span
            className={`text-xl font-bold font-mono mt-1 ${
              daysRemaining === 0
                ? "text-[#16A34A]"
                : daysRemaining < 30
                ? "text-[#D97706]"
                : "text-[#0F172A]"
            }`}
          >
            {daysRemaining === 0 ? "Delivered" : `${daysRemaining}d`}
          </span>
          <span className="text-[10px] text-[#64748B] mt-0.5">
            {daysRemaining === 0 ? "All Milestones Met" : "Target Completion"}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center text-center">
          <span className="text-[11px] font-medium text-[#64748B]">
            Pending Tasks
          </span>
          <span className="text-xl font-bold font-mono text-[#0F172A] mt-1">
            {pendingMilestones}
          </span>
          <span className="text-[10px] text-[#64748B] mt-0.5">
            Active Research Scope
          </span>
        </div>
      </div>

      {/* Burn-down Progress Comparison Visual */}
      <div className="space-y-4 pt-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#D97706]" />
          Milestone Velocity Trajectory
        </h4>

        <div className="space-y-3">
          {burnDownData.map((dp, idx) => {
            const variance = dp.actualProgress - dp.plannedProgress;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0F172A]">{dp.milestone}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-[#64748B]">{dp.date}</span>
                    <span className="text-[#166534] font-bold">{dp.actualProgress}%</span>
                    <span
                      className={`text-[10px] ${
                        variance >= 0 ? "text-[#16A34A]" : "text-[#D97706]"
                      }`}
                    >
                      ({variance >= 0 ? `+${variance}%` : `${variance}%`})
                    </span>
                  </div>
                </div>

                {/* Progress Dual Bar */}
                <div className="w-full h-3 rounded-full bg-[#EEF2F7] overflow-hidden relative">
                  {/* Planned Background Bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-[#166534]/25 rounded-full"
                    style={{ width: `${dp.plannedProgress}%` }}
                  />
                  {/* Actual Overlay Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dp.actualProgress >= dp.plannedProgress
                        ? "bg-[#166534]"
                        : "bg-[#D97706]"
                    }`}
                    style={{ width: `${dp.actualProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
