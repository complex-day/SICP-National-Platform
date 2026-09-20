"use client";

import React from "react";
import { PilotDeployment } from "../types/partnership.types";
import { DeploymentStatusBadge } from "./DeploymentStatusBadge";
import {
  MapPin,
  Activity,
  Users,
  HardDrive,
  ExternalLink,
  FileCheck2,
  UploadCloud,
  Calendar,
} from "lucide-react";

interface DeploymentCardProps {
  deployment: PilotDeployment;
  onUploadEvidence?: (deployment: PilotDeployment) => void;
}

export function DeploymentCard({ deployment, onUploadEvidence }: DeploymentCardProps) {
  const formattedDate = new Date(deployment.startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="glass-panel p-5 rounded-xl border border-border flex flex-col justify-between hover:border-primary/40 transition-all group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <DeploymentStatusBadge status={deployment.status} />
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <h3 className="font-semibold text-foreground text-base tracking-tight mb-1 group-hover:text-primary transition-colors">
          {deployment.locationName}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          <span>
            {deployment.district}, {deployment.state}
          </span>
        </div>

        <p className="text-xs text-muted-foreground/90 line-clamp-2 mb-4 bg-muted/30 p-2.5 rounded-lg border border-border/40">
          <span className="font-medium text-foreground">Impact: </span>
          {deployment.impactSummary}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-muted/40 p-2 rounded-lg border border-border/40 flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-primary" />
            <div>
              <div className="font-bold text-foreground text-xs">{deployment.installedUnits} Units</div>
              <div className="text-[10px] text-muted-foreground uppercase">Hardware Node</div>
            </div>
          </div>

          <div className="bg-muted/40 p-2 rounded-lg border border-border/40 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-emerald-500" />
            <div>
              <div className="font-bold text-foreground text-xs">
                {deployment.beneficiariesCount.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Beneficiaries</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {deployment.telemetryLiveUrl && (
            <a
              href={deployment.telemetryLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
            >
              <Activity className="h-3 w-3 animate-pulse" />
              Live Telemetry
              <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
            </a>
          )}

          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-muted/40 rounded-lg border border-border/40">
            <FileCheck2 className="h-3 w-3 text-primary" />
            <span>{deployment.evidenceCount} Files</span>
          </div>
        </div>

        {onUploadEvidence && (
          <button
            onClick={() => onUploadEvidence(deployment)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border"
          >
            <UploadCloud className="h-3.5 w-3.5 text-primary" />
            Evidence
          </button>
        )}
      </div>
    </div>
  );
}
