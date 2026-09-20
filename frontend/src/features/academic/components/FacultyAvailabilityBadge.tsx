"use client";

import React from "react";
import { FacultyAvailability } from "../types/academic.types";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  availability: FacultyAvailability;
  activeCount?: number;
  maxCapacity?: number;
  showCount?: boolean;
  className?: string;
}

export function FacultyAvailabilityBadge({
  availability,
  activeCount,
  maxCapacity = 3,
  showCount = false,
  className,
}: Props) {
  switch (availability) {
    case "AVAILABLE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Available</span>
          {showCount && activeCount !== undefined && (
            <span className="opacity-75 font-mono text-[10px]">({activeCount}/{maxCapacity})</span>
          )}
        </span>
      );
    case "NEAR_CAPACITY":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20",
            className
          )}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Near Capacity</span>
          {showCount && activeCount !== undefined && (
            <span className="opacity-75 font-mono text-[10px]">({activeCount}/{maxCapacity})</span>
          )}
        </span>
      );
    case "FULL":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20",
            className
          )}
        >
          <XCircle className="w-3 h-3" />
          <span>Full Capacity</span>
          {showCount && activeCount !== undefined && (
            <span className="opacity-75 font-mono text-[10px]">({activeCount}/{maxCapacity})</span>
          )}
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
          {availability}
        </span>
      );
  }
}
