"use client";

import React from "react";
import { MilestoneStatus } from "../types/project.types";
import { cn } from "@/lib/utils";
import { Clock, PlayCircle, Send, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  status: MilestoneStatus;
  className?: string;
}

export function MilestoneStatusBadge({ status, className }: Props) {
  switch (status) {
    case "PENDING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border",
            className
          )}
        >
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-300",
            className
          )}
        >
          <PlayCircle className="w-3 h-3 animate-pulse" />
          In Progress
        </span>
      );
    case "SUBMITTED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300",
            className
          )}
        >
          <Send className="w-3 h-3" />
          Submitted
        </span>
      );
    case "VERIFIED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#166534] border border-emerald-300",
            className
          )}
        >
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-300",
            className
          )}
        >
          <XCircle className="w-3 h-3" />
          Revision Needed
        </span>
      );
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border",
            className
          )}
        >
          {status}
        </span>
      );
  }
}
