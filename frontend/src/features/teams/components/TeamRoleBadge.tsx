import React from "react";
import { TeamRole } from "@/features/teams/types/team.types";
import { Crown, Star, UserCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamRoleBadgeProps {
  role: TeamRole | string;
  className?: string;
  showIcon?: boolean;
}

const roleConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  leader: {
    label: "Team Leader",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
    icon: Crown,
  },
  co_leader: {
    label: "Co-Leader",
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-300",
    icon: Star,
  },
  member: {
    label: "Core Member",
    bg: "bg-blue-50",
    text: "text-[#0052CC]",
    border: "border-blue-200",
    icon: UserCheck,
  },
  mentor: {
    label: "Faculty Mentor",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
    icon: GraduationCap,
  },
};

export const TeamRoleBadge: React.FC<TeamRoleBadgeProps> = ({
  role,
  className = "",
  showIcon = true,
}) => {
  const key = (role || "member").toLowerCase().replace(/[-\s]/g, "_");
  const config = roleConfig[key] || roleConfig.member;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide",
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
