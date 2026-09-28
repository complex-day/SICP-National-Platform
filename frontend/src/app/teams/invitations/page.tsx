"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { TeamInvitation } from "@/features/teams/types/team.types";
import { TeamRoleBadge } from "@/features/teams/components/TeamRoleBadge";
import { teamService } from "@/services/team.service";
import { Mail, CheckCircle2, XCircle, ArrowUpRight, Inbox, Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamInvitationsPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const list = await teamService.listInvitations(activeTab);
      setInvitations(list);
    } catch (err) {
      console.error("Failed to load invitations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [activeTab]);

  const handleAction = async (id: string, action: "ACCEPT" | "REJECT" | "CANCEL") => {
    try {
      const res = await teamService.respondInvitation(id, action);
      setFeedback({ message: res.message, type: "success" });
      fetchInvitations();
    } catch (err: any) {
      setFeedback({ message: err?.message || "Action failed.", type: "error" });
    }
  };

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        <PageHeader
          title="Team Invitations"
          description="Manage invitations received from squad leaders or review pending recruitment invites dispatched to research candidates."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Teams", href: "/teams" },
            { label: "Invitations" },
          ]}
          actions={
            <Link
              href="/teams"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
            >
              <span>Explore Teams</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        />

        {feedback && (
          <div
            className={cn(
              "p-4 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in",
              feedback.type === "success"
                ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                : "bg-destructive/10 border border-destructive/20 text-destructive"
            )}
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs Control */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("incoming")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2",
              activeTab === "incoming"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Incoming Invitations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("outgoing")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2",
              activeTab === "outgoing"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Outgoing Invitations</span>
          </button>
        </div>

        {/* List Content */}
        {isLoading ? (
          <LoadingState message="Loading squad invitations..." />
        ) : invitations.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              activeTab === "incoming"
                ? "No incoming team invitations"
                : "No outgoing invitations dispatched"
            }
            description={
              activeTab === "incoming"
                ? "When squad leads discover your technical skills and invite you, they will appear here."
                : "You haven't sent any invitations to candidates yet. Visit your squad workspace to invite members."
            }
            action={{
              label: "Explore Squads Directory",
              href: "/teams",
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="glass-panel border border-border/80 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary">
                      {activeTab === "incoming" ? `Invited by ${inv.inviterName}` : `Invited ${inv.inviteeName}`}
                    </span>
                    <TeamRoleBadge role={inv.role} />
                  </div>

                  <h3 className="text-sm font-bold text-foreground">
                    <Link href={`/teams/${inv.teamId}`} className="hover:text-primary transition-colors">
                      {inv.teamName}
                    </Link>
                  </h3>

                  {inv.message && (
                    <p className="text-xs text-muted-foreground italic bg-muted/40 p-3 rounded-xl border border-border/60 leading-relaxed">
                      &ldquo;{inv.message}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Dispatched on {new Date(inv.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-muted">
                      {inv.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {inv.status === "PENDING" && (
                  <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                    {activeTab === "incoming" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(inv.id, "ACCEPT")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#166534] text-white font-bold text-xs hover:bg-[#14532D] transition-all shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Accept & Join</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(inv.id, "REJECT")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:bg-red-50 text-[#475569] hover:text-[#DC2626] font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(inv.id, "CANCEL")}
                        className="w-full py-2 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:bg-red-50 text-[#475569] hover:text-[#DC2626] font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Revoke Invitation
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
