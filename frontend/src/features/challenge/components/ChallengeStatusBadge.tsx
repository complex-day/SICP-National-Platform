import React from "react";
import { ChallengeStatus } from "../types/challenge.types";

interface ChallengeStatusBadgeProps {
  status: ChallengeStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft: {
    label: "Draft",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  submitted: {
    label: "Submitted",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  under_review: {
    label: "Under Review",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  approved: {
    label: "Approved",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
  published: {
    label: "Published",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
  archived: {
    label: "Archived",
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
  },
};

export const ChallengeStatusBadge: React.FC<ChallengeStatusBadgeProps> = ({ status, className = "" }) => {
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    bg: "bg-zinc-800",
    text: "text-zinc-300",
    border: "border-zinc-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {config.label}
    </span>
  );
};
