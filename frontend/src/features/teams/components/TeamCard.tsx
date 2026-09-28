import React from "react";
import Link from "next/link";
import { Team } from "@/features/teams/types/team.types";
import { TeamStatusBadge } from "./TeamStatusBadge";
import {
  Users,
  Building2,
  Sparkles,
  ArrowUpRight,
  UserPlus,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: Team;
  onRequestJoin?: (team: Team) => void;
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onRequestJoin,
  className,
}) => {
  const memberCount = team.members?.length || 0;
  const maxMembers = team.maxMembers || 6;
  const hasOpenSlots = memberCount < maxMembers && team.status !== "LOCKED" && team.status !== "COMPLETED";

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E2E8F0] p-5 sm:p-6 flex flex-col justify-between hover:border-[#166534]/50 shadow-xs transition-colors duration-200 group relative",
        className
      )}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2F7] text-[#166534] border border-[#E2E8F0] text-xs font-semibold">
              {team.institution}
            </span>
          </div>
          <TeamStatusBadge status={team.status} />
        </div>

        {/* Team Name */}
        <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#166534] transition-colors line-clamp-1 mb-1.5">
          <Link href={`/teams/${team.id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {team.name}
          </Link>
        </h3>

        {/* Linked Challenge Box */}
        {team.challengeTitle && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block mb-0.5">
              Working On Challenge:
            </span>
            <span className="font-semibold text-[#0F172A] line-clamp-1">
              {team.challengeTitle}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
          {team.description}
        </p>

        {/* Leader and Roster Stats */}
        <div className="space-y-2 text-xs text-[#64748B] mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[#0F172A] truncate">
              <span className="text-[#64748B]">Lead:</span>
              <strong className="text-[#0F172A]">{team.leaderName}</strong>
            </span>

            <div className="flex items-center gap-1 font-semibold shrink-0">
              <Users className="h-3.5 w-3.5 text-[#166534]" />
              <span className="text-[#0F172A]">
                {memberCount}/{maxMembers}
              </span>
              <span className="text-[10px] text-[#64748B]">Members</span>
            </div>
          </div>

          {/* Roster Capacity Progress Bar */}
          <div className="w-full bg-[#EEF2F7] rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                memberCount >= maxMembers
                  ? "bg-[#D97706]"
                  : "bg-[#166534]"
              )}
              style={{ width: `${(memberCount / maxMembers) * 100}%` }}
            />
          </div>
        </div>

        {/* Required Skills Tags */}
        {team.requiredSkills && team.requiredSkills.length > 0 && (
          <div className="space-y-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Required Skills:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {team.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-[#EEF2F7] text-[11px] font-semibold text-[#0F172A] border border-[#E2E8F0]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3.5 border-t border-[#E2E8F0] flex items-center justify-between text-xs relative z-10 gap-2">
        <span className="text-[11px] text-[#64748B]">
          {hasOpenSlots ? (
            <span className="text-[#166534] font-semibold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
              Open for Applications
            </span>
          ) : (
            <span className="text-[#64748B]">Squad Roster Full</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {hasOpenSlots && onRequestJoin && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestJoin(team);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-[#166534] text-[#166534] hover:text-white border border-emerald-300 text-xs font-bold transition-all cursor-pointer z-20"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Request Join</span>
            </button>
          )}

          <Link
            href={`/teams/${team.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EEF2F7] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold shadow-xs transition-colors z-20"
          >
            <span>Workspace</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#64748B]" />
          </Link>
        </div>
      </div>
    </div>
  );
};
