"use client";

import React from "react";
import { PartnershipStatus } from "../types/partnership.types";
import { cn } from "@/lib/utils";
import { Clock, FileCheck, CheckCircle2, Sparkles, XCircle } from "lucide-react";

interface Props {
  status: PartnershipStatus;
  className?: string;
}

export function PartnershipStatusBadge({ status, className }: Props) {
  switch (status) {
    case "PROPOSED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20",
            className
          )}
        >
          <Clock className="w-3 h-3" />
          Proposed
        </span>
      );
    case "MOU_SIGNED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20",
            className
          )}
        >
          <FileCheck className="w-3 h-3" />
          MoU Signed
        </span>
      );
    case "ACTIVE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          <CheckCircle2 className="w-3 h-3 animate-pulse" />
          Active Partnership
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20",
            className
          )}
        >
          <Sparkles className="w-3 h-3" />
          Commercialized / Complete
        </span>
      );
    case "TERMINATED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20",
            className
          )}
        >
          <XCircle className="w-3 h-3" />
          Terminated
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
