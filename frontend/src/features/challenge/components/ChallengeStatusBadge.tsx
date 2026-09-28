import React from "react";
import { ChallengeStatus } from "@/features/challenges/types/challenge.types";
import { cn } from "@/lib/utils";

interface ChallengeStatusBadgeProps {
  status: ChallengeStatus | string;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  draft: {
    label: "Draft",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    dot: "bg-slate-400",
  },
  submitted: {
    label: "Submitted",
    bg: "bg-sky-50",
    text: "text-[#0369A1]",
    border: "border-sky-200",
    dot: "bg-[#0369A1]",
  },
  under_review: {
    label: "Under Review",
    bg: "bg-amber-50",
    text: "text-[#D97706]",
    border: "border-amber-200",
    dot: "bg-[#D97706]",
  },
  claimed: {
    label: "Assigned",
    bg: "bg-emerald-50",
    text: "text-[#166534]",
    border: "border-emerald-200",
    dot: "bg-[#166534]",
  },
  assigned: {
    label: "Assigned",
    bg: "bg-emerald-50",
    text: "text-[#166534]",
    border: "border-emerald-200",
    dot: "bg-[#166534]",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-emerald-50",
    text: "text-[#166534]",
    border: "border-emerald-200",
    dot: "bg-[#16A34A] animate-pulse",
  },
  active: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-[#166534]",
    border: "border-emerald-200",
    dot: "bg-[#16A34A] animate-pulse",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-emerald-50",
    text: "text-[#14532D]",
    border: "border-emerald-200",
    dot: "bg-[#166534]",
  },
  validated: {
    label: "Validated",
    bg: "bg-emerald-50",
    text: "text-[#166534]",
    border: "border-emerald-200",
    dot: "bg-[#166534]",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-[#DC2626]",
    border: "border-red-200",
    dot: "bg-[#DC2626]",
  },
  // Backward-compat aliases
  approved: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-[#166534]",
    border: "border-emerald-200",
    dot: "bg-[#166534]",
  },
  published: {
    label: "Published",
    bg: "bg-emerald-50",
    text: "text-[#166534]",
    border: "border-emerald-200",
    dot: "bg-[#166534]",
  },
};

export const ChallengeStatusBadge: React.FC<ChallengeStatusBadgeProps> = ({
  status,
  className = "",
  size = "sm",
}) => {
  const normalizedKey = status ? status.toLowerCase().replace(/[-\s]/g, "_") : "draft";
  const config = statusConfig[normalizedKey] || {
    label: status || "Unknown",
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
    dot: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border shadow-2xs tracking-wide transition-all",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("rounded-full shrink-0 mr-1.5", size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2", config.dot)} />
      {config.label}
    </span>
  );
};
