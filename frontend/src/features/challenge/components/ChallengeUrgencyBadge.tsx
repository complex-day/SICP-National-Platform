import React from "react";
import { UrgencyLevel } from "@/features/challenges/types/challenge.types";
import { AlertCircle, AlertTriangle, Flame, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeUrgencyBadgeProps {
  urgency: UrgencyLevel | string;
  className?: string;
  showIcon?: boolean;
}

const urgencyConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  low: {
    label: "Low Priority",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: Info,
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: AlertCircle,
  },
  high: {
    label: "High Urgency",
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical Urgency",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-300",
    icon: Flame,
  },
};

export const ChallengeUrgencyBadge: React.FC<ChallengeUrgencyBadgeProps> = ({
  urgency,
  className = "",
  showIcon = true,
}) => {
  const key = (urgency || "medium").toLowerCase();
  const config = urgencyConfig[key] || urgencyConfig.medium;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border tracking-wide",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
