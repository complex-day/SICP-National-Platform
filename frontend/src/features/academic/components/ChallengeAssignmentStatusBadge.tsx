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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300",
            className
          )}
        >
          <Clock className="w-3 h-3" />
          Intake Pending
        </span>
      );
    case "CLAIMED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border-emerald-300",
            className
          )}
        >
          <FlaskConical className="w-3 h-3" />
          Active Research
        </span>
      );
    case "RESOLVED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#14532D] border-emerald-300",
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
