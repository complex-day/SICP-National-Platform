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
          color: "bg-emerald-50 text-[#166534] border-emerald-300",
          icon: Award,
        };
      case "NON_EXCLUSIVE_COMMERCIAL":
        return {
          label: "Commercial License",
          color: "bg-sky-50 text-sky-800 border-sky-300",
          icon: ShieldCheck,
        };
      case "PROVISIONAL":
        return {
          label: "Provisional IP",
          color: "bg-amber-50 text-amber-800 border-amber-300",
          icon: FileText,
        };
      case "PUBLIC_COMMONS":
        return {
          label: "Open Public Commons",
          color: "bg-emerald-50 text-[#166534] border-emerald-300",
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
