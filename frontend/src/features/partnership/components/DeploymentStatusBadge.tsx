"use client";

import React from "react";
import { DeploymentStatus } from "../types/partnership.types";
import { cn } from "@/lib/utils";
import { MapPin, Wrench, Activity, CheckCircle2, Rocket } from "lucide-react";

interface Props {
  status: DeploymentStatus;
  className?: string;
}

export function DeploymentStatusBadge({ status, className }: Props) {
  switch (status) {
    case "SITE_IDENTIFIED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300",
            className
          )}
        >
          <MapPin className="w-3 h-3" />
          Site Identified
        </span>
      );
    case "HARDWARE_INSTALLED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-300",
            className
          )}
        >
          <Wrench className="w-3 h-3" />
          Installed
        </span>
      );
    case "LIVE_TELEMETRY":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300",
            className
          )}
        >
          <Activity className="w-3 h-3 animate-pulse" />
          Live Telemetry
        </span>
      );
    case "EVALUATED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border-emerald-300",
            className
          )}
        >
          <CheckCircle2 className="w-3 h-3" />
          Evaluated
        </span>
      );
    case "COMMERCIALIZED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#14532D] border border-emerald-300",
            className
          )}
        >
          <Rocket className="w-3 h-3" />
          Commercial Scale
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
