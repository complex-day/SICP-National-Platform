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
    <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">
              Planned vs. Actual Milestone Progress & Trajectory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-primary/40 inline-block" /> Planned
          </span>
          <span className="flex items-center gap-1 text-primary font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Actual
          </span>
        </div>
      </div>

      {/* 3 Quick Stat Blocks */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-col items-center text-center">
          <span className="text-[11px] font-medium text-muted-foreground">
            Lifecycle Progress
          </span>
          <span className="text-xl font-bold font-mono text-primary mt-1">
            {completionPercentage}%
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {completedMilestones} of {totalMilestones} Verified
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-col items-center text-center">
          <span className="text-[11px] font-medium text-muted-foreground">
            Schedule Runway
          </span>
          <span
            className={`text-xl font-bold font-mono mt-1 ${
              daysRemaining === 0
                ? "text-emerald-400"
                : daysRemaining < 30
                ? "text-amber-400"
                : "text-foreground"
            }`}
          >
            {daysRemaining === 0 ? "Delivered" : `${daysRemaining}d`}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {daysRemaining === 0 ? "All Milestones Met" : "Target Completion"}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-col items-center text-center">
          <span className="text-[11px] font-medium text-muted-foreground">
            Pending Tasks
          </span>
          <span className="text-xl font-bold font-mono text-foreground mt-1">
            {pendingMilestones}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            Active Research Scope
          </span>
        </div>
      </div>

      {/* Burn-down Progress Comparison Visual */}
      <div className="space-y-4 pt-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          Milestone Velocity Trajectory
        </h4>

        <div className="space-y-3">
          {burnDownData.map((dp, idx) => {
            const variance = dp.actualProgress - dp.plannedProgress;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{dp.milestone}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-muted-foreground">{dp.date}</span>
                    <span className="text-primary font-bold">{dp.actualProgress}%</span>
                    <span
                      className={`text-[10px] ${
                        variance >= 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      ({variance >= 0 ? `+${variance}%` : `${variance}%`})
                    </span>
                  </div>
                </div>

                {/* Progress Dual Bar */}
                <div className="w-full h-3 rounded-full bg-muted/80 overflow-hidden relative">
                  {/* Planned Background Bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-primary/25 rounded-full"
                    style={{ width: `${dp.plannedProgress}%` }}
                  />
                  {/* Actual Overlay Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dp.actualProgress >= dp.plannedProgress
                        ? "bg-primary shadow-glow-sm"
                        : "bg-amber-500"
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
