"use client";

import React from "react";
import { ProjectStage } from "../types/project.types";
import { cn } from "@/lib/utils";
import { FileText, Cpu, Rocket, CheckCircle2 } from "lucide-react";

interface Props {
  stage: ProjectStage;
  className?: string;
}

export function ProjectStageBadge({ stage, className }: Props) {
  switch (stage) {
    case "PROPOSAL":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300",
            className
          )}
        >
          <FileText className="w-3 h-3" />
          Proposal
        </span>
      );
    case "DEVELOPMENT":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300",
            className
          )}
        >
          <Cpu className="w-3 h-3 animate-pulse" />
          Development
        </span>
      );
    case "PILOT":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300",
            className
          )}
        >
          <Rocket className="w-3 h-3" />
          Pilot Stage
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300",
            className
          )}
        >
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border",
            className
          )}
        >
          {stage}
        </span>
      );
  }
}
