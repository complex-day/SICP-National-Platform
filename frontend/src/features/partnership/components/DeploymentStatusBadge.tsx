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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
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
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20",
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
