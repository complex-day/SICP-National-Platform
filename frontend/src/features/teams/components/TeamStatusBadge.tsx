import React from "react";
import { TeamStatus } from "@/features/teams/types/team.types";
import { cn } from "@/lib/utils";

interface TeamStatusBadgeProps {
  status: TeamStatus | string;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  forming: {
    label: "Forming",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  recruiting: {
    label: "Recruiting",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    dot: "bg-emerald-600 animate-pulse",
  },
  locked: {
    label: "Roster Locked",
    bg: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-300",
    dot: "bg-indigo-600",
  },
  active: {
    label: "Active R&D",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-300",
    dot: "bg-[#0052CC]",
  },
  completed: {
    label: "Completed",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-300",
    dot: "bg-purple-600",
  },
  disbanded: {
    label: "Disbanded",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
    dot: "bg-slate-400",
  },
};

export const TeamStatusBadge: React.FC<TeamStatusBadgeProps> = ({
  status,
  className = "",
  size = "sm",
}) => {
  const normalizedKey = status ? status.toLowerCase().replace(/[-\s]/g, "_") : "forming";
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
