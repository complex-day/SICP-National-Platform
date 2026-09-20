"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Team, TeamFiltersState } from "@/features/teams/types/team.types";
import { TeamCard } from "@/features/teams/components/TeamCard";
import { TeamFilters } from "@/features/teams/components/TeamFilters";
import { TeamStatusBadge } from "@/features/teams/components/TeamStatusBadge";
import { RequestJoinModal } from "@/features/teams/components/RequestJoinModal";
import { teamService } from "@/services/team.service";
import {
  Users,
  Plus,
  LayoutGrid,
  List,
  Mail,
  UserCheck,
  Building2,
  ArrowUpRight,
  Inbox,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamsDirectoryPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [teams, setTeams] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TeamFiltersState>({
    page: 1,
    limit: 50,
    sortBy: "newest",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeamForJoin, setSelectedTeamForJoin] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const res = await teamService.listTeams(filters);
      setTeams(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load teams directory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [filters]);

  const tableColumns: ColumnDef<Team>[] = [
    {
      key: "name",
      header: "Team Name",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs py-1">
          <Link
            href={`/teams/${row.id}`}
            className="font-bold text-foreground hover:text-primary transition-colors text-xs sm:text-sm line-clamp-1"
          >
            {row.name}
          </Link>
          <span className="text-[11px] text-muted-foreground block truncate">
            {row.institution}
          </span>
        </div>
      ),
    },
    {
      key: "challenge",
      header: "Linked Challenge",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs text-xs">
          <span className="font-semibold text-foreground line-clamp-1">
            {row.challengeTitle || "General Exploration"}
          </span>
          <span className="text-[10px] text-muted-foreground block">
            {row.challengeCategory || "Innovation"}
          </span>
        </div>
      ),
    },
    {
      key: "leader",
      header: "Team Lead",
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
          {row.leaderName}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => <TeamStatusBadge status={row.status} />,
    },
    {
      key: "members",
      header: "Roster Size",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground whitespace-nowrap">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>
            {row.members?.length || 0} / {row.maxMembers || 6}
          </span>
        </div>
      ),
    },
    {
      key: "skills",
      header: "Required Skills",
      render: (row) => (
        <div className="flex items-center gap-1 flex-wrap max-w-xs">
          {row.requiredSkills?.slice(0, 3).map((sk) => (
            <span
              key={sk}
              className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground/80 border border-border"
            >
              {sk}
            </span>
          ))}
          {(row.requiredSkills?.length || 0) > 3 && (
            <span className="text-[10px] text-muted-foreground font-semibold">
              +{(row.requiredSkills?.length || 0) - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.members.length < row.maxMembers && row.status !== "LOCKED" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTeamForJoin(row);
              }}
              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-all cursor-pointer"
            >
              Join
            </button>
          )}
          <Link
            href={`/teams/${row.id}`}
            className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        <PageHeader
          title="Multidisciplinary Teams & Roster"
          description="Form engineering squads, discover university research teams, and collaborate with student innovators on grassroots civic challenges."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Teams Directory" },
          ]}
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/teams/invitations"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span>Invitations</span>
              </Link>

              <Link
                href="/teams/requests"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
              >
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Join Requests</span>
              </Link>

              <Link
                href="/teams/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Team</span>
              </Link>
            </div>
          }
        />

        {/* Filters */}
        <TeamFilters filters={filters} onChange={setFilters} />

        {/* View Switcher and Counter */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{teams.length}</strong> of{" "}
            <strong className="text-foreground">{total}</strong> innovation squads
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "card"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Content Render */}
        {isLoading ? (
          <LoadingState message="Loading multidisciplinary team squads..." />
        ) : teams.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No teams match your criteria"
            description="Try changing skill requirements or status filters, or establish a new team."
            action={{
              label: "Create a New Team",
              href: "/teams/create",
            }}
            secondaryAction={{
              label: "Reset Filters",
              onClick: () =>
                setFilters({
                  page: 1,
                  limit: 50,
                  sortBy: "newest",
                }),
            }}
          />
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onRequestJoin={(t) => setSelectedTeamForJoin(t)}
              />
            ))}
          </div>
        ) : (
          <DataTable<Team>
            columns={tableColumns}
            data={teams}
            pageSize={10}
            onRowClick={(row) => router.push(`/teams/${row.id}`)}
          />
        )}

        {/* Modal for Request Join */}
        {selectedTeamForJoin && (
          <RequestJoinModal
            team={selectedTeamForJoin}
            isOpen={Boolean(selectedTeamForJoin)}
            onClose={() => setSelectedTeamForJoin(null)}
            onSuccess={() => {
              fetchTeams();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
