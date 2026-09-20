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
        "glass-panel rounded-2xl border border-border/80 p-5 sm:p-6 flex flex-col justify-between hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden",
        className
      )}
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              {team.institution}
            </span>
          </div>
          <TeamStatusBadge status={team.status} />
        </div>

        {/* Team Name */}
        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
          <Link href={`/teams/${team.id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {team.name}
          </Link>
        </h3>

        {/* Linked Challenge Box */}
        {team.challengeTitle && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-muted/40 border border-border/70 text-xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">
              Working On Challenge:
            </span>
            <span className="font-semibold text-foreground line-clamp-1">
              {team.challengeTitle}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {team.description}
        </p>

        {/* Leader and Roster Stats */}
        <div className="space-y-2 text-xs text-muted-foreground mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-foreground/90 truncate">
              <span className="text-muted-foreground">Lead:</span>
              <strong className="text-foreground">{team.leaderName}</strong>
            </span>

            <div className="flex items-center gap-1 font-semibold shrink-0">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground">
                {memberCount}/{maxMembers}
              </span>
              <span className="text-[10px] text-muted-foreground">Members</span>
            </div>
          </div>

          {/* Roster Capacity Progress Bar */}
          <div className="w-full bg-muted/80 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                memberCount >= maxMembers
                  ? "bg-amber-500"
                  : "bg-primary"
              )}
              style={{ width: `${(memberCount / maxMembers) * 100}%` }}
            />
          </div>
        </div>

        {/* Required Skills Tags */}
        {team.requiredSkills && team.requiredSkills.length > 0 && (
          <div className="space-y-1.5 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Required Skills:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {team.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold text-foreground/80 border border-border/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3.5 border-t border-border/60 flex items-center justify-between text-xs relative z-10 gap-2">
        <span className="text-[11px] text-muted-foreground">
          {hasOpenSlots ? (
            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Open for Applications
            </span>
          ) : (
            <span className="text-muted-foreground">Squad Roster Full</span>
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
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-xs font-bold transition-all cursor-pointer z-20"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Request Join</span>
            </button>
          )}

          <Link
            href={`/teams/${team.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted text-foreground border border-border text-xs font-semibold transition-colors z-20"
          >
            <span>Workspace</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};
