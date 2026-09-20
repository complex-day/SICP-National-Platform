"use client";

import React from "react";
import { ProjectStage, PROJECT_STAGES } from "../types/project.types";
import { cn } from "@/lib/utils";
import { FileText, Cpu, Rocket, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface Props {
  currentStage: ProjectStage;
  onAdvanceStage?: (nextStage: ProjectStage) => void;
  canAdvance?: boolean;
}

const STAGE_CONFIG: Record<
  ProjectStage,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PROPOSAL: {
    label: "Proposal",
    description: "Architecture & Modeling",
    icon: FileText,
  },
  DEVELOPMENT: {
    label: "Development",
    description: "CAD, Code & Prototyping",
    icon: Cpu,
  },
  PILOT: {
    label: "Field Pilot",
    description: "Deployment & Stress Trials",
    icon: Rocket,
  },
  COMPLETED: {
    label: "Completed",
    description: "IP & Handover Transfer",
    icon: CheckCircle2,
  },
};

export function ProjectStageStepper({
  currentStage,
  onAdvanceStage,
  canAdvance = false,
}: Props) {
  const currentIndex = PROJECT_STAGES.indexOf(currentStage);
  const nextStage =
    currentIndex < PROJECT_STAGES.length - 1 ? PROJECT_STAGES[currentIndex + 1] : null;

  return (
    <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Project Lifecycle Stage Workflow
          </h4>
          <p className="text-xs text-foreground font-medium mt-0.5">
            Current Stage:{" "}
            <span className="text-primary font-bold">{STAGE_CONFIG[currentStage].label}</span>
          </p>
        </div>

        {nextStage && onAdvanceStage && (
          <button
            onClick={() => onAdvanceStage(nextStage)}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-1.5 transition-all"
          >
            <span>Advance to {STAGE_CONFIG[nextStage].label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative pt-2">
        {PROJECT_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;
          const config = STAGE_CONFIG[stage];
          const IconComponent = config.icon;

          return (
            <div
              key={stage}
              className={cn(
                "p-3.5 rounded-xl border transition-all relative flex flex-col justify-between gap-2",
                isCurrent
                  ? "bg-primary/10 border-primary/50 shadow-glow-sm"
                  : isCompleted
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-muted/30 border-border/60 opacity-60"
              )}
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-glow-sm"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
                <span className="font-mono text-[11px] font-bold text-muted-foreground">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <div
                  className={cn(
                    "font-semibold text-xs",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-muted-foreground"
                  )}
                >
                  {config.label}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {config.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
