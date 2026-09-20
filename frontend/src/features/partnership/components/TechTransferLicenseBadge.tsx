"use client";

import React from "react";
import { LicenseType, AdoptionStatus } from "../types/partnership.types";
import { cn } from "@/lib/utils";
import { ShieldCheck, Award, FileText, Globe } from "lucide-react";

interface Props {
  licenseType: LicenseType;
  crlLevel?: number;
  adoptionStatus?: AdoptionStatus;
  className?: string;
}

export function TechTransferLicenseBadge({
  licenseType,
  crlLevel,
  adoptionStatus,
  className,
}: Props) {
  const getBadgeDetails = () => {
    switch (licenseType) {
      case "EXCLUSIVE_PATENT":
        return {
          label: "Exclusive Patent",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          icon: Award,
        };
      case "NON_EXCLUSIVE_COMMERCIAL":
        return {
          label: "Commercial License",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: ShieldCheck,
        };
      case "PROVISIONAL":
        return {
          label: "Provisional IP",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: FileText,
        };
      case "PUBLIC_COMMONS":
        return {
          label: "Open Public Commons",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: Globe,
        };
    }
  };

  const { label, color, icon: IconComponent } = getBadgeDetails();

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          color
        )}
      >
        <IconComponent className="w-3 h-3" />
        {label}
      </span>
      {crlLevel !== undefined && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-foreground border border-border">
          CRL-{crlLevel}
        </span>
      )}
    </div>
  );
}
