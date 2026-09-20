"use client";

import React from "react";
import { ChallengeAssignmentStatus } from "../types/academic.types";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, Building2, FlaskConical, ShieldCheck } from "lucide-react";

interface Props {
  status: ChallengeAssignmentStatus;
  className?: string;
}

export function ChallengeAssignmentStatusBadge({ status, className }: Props) {
  switch (status) {
    case "INTAKE_PENDING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20",
            className
          )}
        >
          <Clock className="w-3 h-3 animate-pulse" />
          Intake Pending
        </span>
      );
    case "CLAIMED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
            className
          )}
        >
          <Building2 className="w-3 h-3" />
          Claimed
        </span>
      );
    case "DEPARTMENT_ASSIGNED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
            className
          )}
        >
          <FlaskConical className="w-3 h-3" />
          Dept Assigned
        </span>
      );
    case "ACTIVE_RESEARCH":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20",
            className
          )}
        >
          <FlaskConical className="w-3 h-3 animate-bounce" />
          Active Research
        </span>
      );
    case "RESOLVED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          <ShieldCheck className="w-3 h-3" />
          Resolved
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
          {status}
        </span>
      );
  }
}
