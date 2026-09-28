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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#14532D] border border-emerald-300",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300",
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
