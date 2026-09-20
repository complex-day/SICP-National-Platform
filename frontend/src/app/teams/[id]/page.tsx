"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  Team,
  TeamMember,
  TeamActivity,
  JoinRequest,
} from "@/features/teams/types/team.types";
import { TeamStatusBadge } from "@/features/teams/components/TeamStatusBadge";
import { TeamRoleBadge } from "@/features/teams/components/TeamRoleBadge";
import { InviteMemberModal } from "@/features/teams/components/InviteMemberModal";
import { RequestJoinModal } from "@/features/teams/components/RequestJoinModal";
import { teamService } from "@/services/team.service";
import { useAuthStore } from "@/store/authStore";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Building2,
  Calendar,
  Compass,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [team, setTeam] = useState<
    (Team & { activities: TeamActivity[]; joinRequests: JoinRequest[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadTeamData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await teamService.getTeam(id);
      setTeam(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load team workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout requireAuth={false}>
        <LoadingState message="Loading squad workspace & collaborative roster..." />
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout requireAuth={false}>
        <ErrorState
          title="Team Not Found"
          message={error || "The squad workspace you are trying to access does not exist."}
          onRetry={() => router.push("/teams")}
          showHomeButton={true}
        />
      </DashboardLayout>
    );
  }

  const isLeader = user?.id === team.leaderId || team.leaderName === user?.full_name;
  const isMember = team.members?.some((m) => m.userId === user?.id || m.email === user?.email);
  const openSlots = team.maxMembers - team.members.length;

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        <PageHeader
          title={team.name}
          badge={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                {team.institution}
              </span>
              <TeamStatusBadge status={team.status} />
            </div>
          }
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Teams", href: "/teams" },
            { label: team.name },
          ]}
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              {openSlots > 0 && !isMember && (
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Request Join</span>
                </button>
              )}

              {openSlots > 0 && (
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Invite Member</span>
                </button>
              )}
            </div>
          }
        />

        {/* Success Alert */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{actionSuccess}</span>
            <button
              type="button"
              onClick={() => setActionSuccess(null)}
              className="text-xs hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 8-Cols Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Team Overview */}
            <div className="glass-panel rounded-2xl border border-border/80 p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Squad Charter & Mission
                </h2>
                <span className="text-xs text-muted-foreground">
                  Established on {new Date(team.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {team.description}
              </p>

              {/* Progress & Stats */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Capstone / R&D Velocity</span>
                  <span className="font-bold text-primary">{team.projectProgress || 35}% Complete</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${team.projectProgress || 35}%` }}
                  />
                </div>
              </div>

              {/* Skill Tags */}
              <div className="pt-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Target Technical Stack
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {team.requiredSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Team Roster (Leader, Co-Leader, Members, Mentor) */}
            <div className="glass-panel rounded-2xl border border-border/80 p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Team Roster ({team.members.length}/{team.maxMembers})
                  </h2>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {openSlots > 0 ? `${openSlots} open slot${openSlots > 1 ? "s" : ""}` : "Roster full"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-2.5 hover:border-primary/40 transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {member.name}
                          </h4>
                          <span className="text-[11px] text-muted-foreground truncate block">
                            {member.department || member.institution || "Research Scholar"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <TeamRoleBadge role={member.role} />
                      <span className="text-[10px] text-muted-foreground">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Member Skills */}
                    {member.skills && member.skills.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {member.skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground/80"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Linked Challenge */}
            {team.challengeId && (
              <div className="glass-panel rounded-2xl border border-border/80 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      Assigned Grassroots Challenge
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                    {team.challengeCategory}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{team.challengeTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Civic challenge claimed by this squad for innovation prototype and field deployment.
                    </p>
                  </div>

                  <Link
                    href={`/challenges/${team.challengeId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shrink-0 shadow-xs"
                  >
                    <span>Inspect Challenge</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar 4-Cols Area: Activity Feed & Pending Requests */}
          <div className="lg:col-span-4 space-y-6">
            {/* Pending Join Requests (Visible for Leaders) */}
            {team.joinRequests && team.joinRequests.length > 0 && (
              <div className="glass-panel rounded-2xl border border-border/80 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Pending Applications ({team.joinRequests.length})
                  </h3>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                    Action Required
                  </span>
                </div>

                <div className="space-y-3">
                  {team.joinRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl border border-border bg-background/60 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-foreground">{req.userName}</strong>
                        <span className="text-[10px] text-muted-foreground">{req.institution}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        &ldquo;{req.statement}&rdquo;
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {req.userSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                        <button
                          type="button"
                          onClick={async () => {
                            await teamService.respondJoinRequest(req.id, "APPROVE");
                            setActionSuccess(`Approved ${req.userName}'s membership request.`);
                            loadTeamData();
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await teamService.respondJoinRequest(req.id, "REJECT");
                            setActionSuccess(`Declined request.`);
                            loadTeamData();
                          }}
                          className="flex-1 py-1.5 rounded-lg border border-border bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-xs font-semibold transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <div className="glass-panel rounded-2xl border border-border/80 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Activity & Audit Trail
                  </h3>
                </div>
              </div>

              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {team.activities.map((act) => (
                  <div key={act.id} className="relative text-xs space-y-1">
                    <div className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background ring-2 ring-primary/20" />
                    <div className="font-bold text-foreground">{act.title}</div>
                    <p className="text-muted-foreground leading-snug">{act.description}</p>
                    <span className="text-[10px] text-muted-foreground/70 block">
                      {new Date(act.timestamp).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <InviteMemberModal
          team={team}
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={() => {
            setActionSuccess("Invitation sent successfully!");
            loadTeamData();
          }}
        />

        <RequestJoinModal
          team={team}
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onSuccess={() => {
            setActionSuccess("Join request submitted to team lead!");
            loadTeamData();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
