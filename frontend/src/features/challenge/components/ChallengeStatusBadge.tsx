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
    bg: "bg-blue-50",
    text: "text-[#0052CC]",
    border: "border-blue-200",
    dot: "bg-[#0052CC]",
  },
  under_review: {
    label: "Under Review",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  claimed: {
    label: "Claimed",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-300",
    dot: "bg-purple-600",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-300",
    dot: "bg-[#0052CC] animate-pulse",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    dot: "bg-emerald-600",
  },
  // Backward-compat aliases
  approved: {
    label: "Approved",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-300",
    dot: "bg-indigo-600",
  },
  published: {
    label: "Published",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    dot: "bg-emerald-600",
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
