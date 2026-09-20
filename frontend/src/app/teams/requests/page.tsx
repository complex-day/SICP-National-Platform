"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { JoinRequest } from "@/features/teams/types/team.types";
import { teamService } from "@/services/team.service";
import { UserCheck, CheckCircle2, XCircle, ArrowUpRight, Inbox, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamJoinRequestsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const list = await teamService.listJoinRequests();
      setRequests(list);
    } catch (err) {
      console.error("Failed to load join requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await teamService.respondJoinRequest(id, action);
      setFeedback({ message: res.message, type: "success" });
      fetchRequests();
    } catch (err: any) {
      setFeedback({ message: err?.message || "Action failed.", type: "error" });
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        <PageHeader
          title="Team Join Requests"
          description="Review applications from student researchers, developers, and designers seeking to join your capstone squads."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Teams", href: "/teams" },
            { label: "Join Requests" },
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

        {isLoading ? (
          <LoadingState message="Loading squad join requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No join requests received"
            description="When innovators discover your squad and apply to open slots, their pitch statements will appear here."
            action={{
              label: "Explore Squads Directory",
              href: "/teams",
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Pending Applications Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>Pending Evaluation ({pendingRequests.length})</span>
                </h3>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 rounded-2xl glass-panel border border-border/80 text-center text-xs text-muted-foreground">
                  All incoming applications have been reviewed.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="glass-panel border border-border/80 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-sm font-bold text-foreground">
                            {req.userName}
                          </strong>
                          <span className="text-xs font-semibold text-primary">
                            Target: {req.teamName}
                          </span>
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                          {req.userEmail} • {req.institution || "National Tech Institute"}
                        </div>

                        {/* Statement */}
                        <p className="text-xs text-foreground/90 bg-muted/40 p-3 rounded-xl border border-border/60 leading-relaxed italic">
                          &ldquo;{req.statement}&rdquo;
                        </p>

                        {/* Skills */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                            Skills:
                          </span>
                          {req.userSkills.map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-foreground border border-border/60"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1">
                          <Clock className="h-3 w-3" />
                          <span>Applied on {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAction(req.id, "APPROVE")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve & Add to Roster</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(req.id, "REJECT")}
                          className="py-2 px-3 rounded-xl border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Processed Requests */}
            {processedRequests.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Processed History ({processedRequests.length})
                </h3>
                <div className="space-y-2">
                  {processedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl border border-border bg-background/50 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-foreground">{req.userName}</span>
                        <span className="text-muted-foreground block text-[11px] truncate">
                          Applied to {req.teamName} on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                          req.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-destructive/10 text-destructive border-destructive/30"
                        )}
                      >
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
