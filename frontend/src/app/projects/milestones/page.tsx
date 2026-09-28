"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, KPICard } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { projectService } from "@/services/project.service";
import {
  ProjectMilestone,
  MilestoneStatus,
  ProjectStage,
} from "@/features/project/types/project.types";
import {
  MilestoneStatusBadge,
  ProjectStageBadge,
} from "@/features/project/components";
import {
  Target,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PlayCircle,
  Send,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type EnrichedMilestone = ProjectMilestone & {
  projectTitle: string;
  teamName: string;
  category: string;
};

const STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Revision Needed", value: "REJECTED" },
];

const STAGES: { label: string; value: string }[] = [
  { label: "All Stages", value: "ALL" },
  { label: "Proposal", value: "PROPOSAL" },
  { label: "Development", value: "DEVELOPMENT" },
  { label: "Pilot", value: "PILOT" },
  { label: "Completed", value: "COMPLETED" },
];

export default function MilestonesManagementPage() {
  const [milestones, setMilestones] = useState<EnrichedMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");

  const loadMilestones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.listAllMilestones({
        search: searchQuery,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        stage: selectedStage === "ALL" ? undefined : selectedStage,
      });
      setMilestones(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load milestones.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, [selectedStatus, selectedStage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMilestones();
  };

  const handleVerify = async (projectId: string, milestoneId: string) => {
    try {
      await projectService.updateMilestoneProgress(
        projectId,
        milestoneId,
        100,
        "VERIFIED",
        "Directly verified via Milestone Hub."
      );
      setSuccessToast("Milestone verified successfully (100% completed).");
      loadMilestones();
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify milestone.";
      setSuccessToast(msg);
    }
  };

  const columns: ColumnDef<EnrichedMilestone>[] = [
    {
      key: "title",
      header: "Milestone & Project",
      sortable: true,
      render: (row: EnrichedMilestone) => (
        <div className="max-w-[320px]">
          <div className="font-semibold text-foreground text-sm line-clamp-1">
            {row.title}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            Project: <span className="text-foreground font-medium">{row.projectTitle}</span>
          </div>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      render: (row: EnrichedMilestone) => <ProjectStageBadge stage={row.stage} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row: EnrichedMilestone) => <MilestoneStatusBadge status={row.status} />,
    },
    {
      key: "progressPercentage",
      header: "Progress %",
      sortable: true,
      render: (row: EnrichedMilestone) => (
        <div className="space-y-1 min-w-[100px]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-foreground">
              {row.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                row.status === "VERIFIED" ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${row.progressPercentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "targetDate",
      header: "Target Due Date",
      sortable: true,
      render: (row: EnrichedMilestone) => (
        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(row.targetDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row: EnrichedMilestone) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.status !== "VERIFIED" && (
            <button
              onClick={() => handleVerify(row.projectId, row.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Verify
            </button>
          )}
          <Link
            href={`/projects/${row.projectId}`}
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <span>Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
  ];

  const totalVerified = milestones.filter((m) => m.status === "VERIFIED").length;
  const totalInProgress = milestones.filter((m) => m.status === "IN_PROGRESS").length;
  const totalSubmitted = milestones.filter((m) => m.status === "SUBMITTED").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#166534] text-sm font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-[#14532D] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="Milestone Management & Velocity Hub"
          description="Cross-project milestone monitoring, deliverable tracking, and faculty sign-off verification."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects", href: "/projects" },
            { label: "Milestones", href: "/projects/milestones" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300">
              Milestone Hub
            </span>
          }
          actions={
            <Link
              href="/projects"
              className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-2 transition-all"
            >
              <span>View Project Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            title="Total Milestones"
            value={milestones.length}
            subtitle="Across all registered capstones"
            icon={Target}
            accentColor="brand"
          />
          <KPICard
            title="Awaiting Review / Submitted"
            value={totalSubmitted}
            subtitle="Ready for faculty sign-off"
            icon={Send}
            accentColor="amber"
          />
          <KPICard
            title="Verified & Completed"
            value={totalVerified}
            subtitle="Verified deliverables"
            icon={CheckCircle2}
            accentColor="emerald"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones by title, project, or team..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs transition-all"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E2E8F0]">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[#475569] font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium">Stage:</span>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {STAGES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedStatus !== "ALL" ||
              selectedStage !== "ALL" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus("ALL");
                  setSelectedStage("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-primary font-semibold hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Table / States */}
        {isLoading ? (
          <LoadingState message="Loading cross-project milestones..." />
        ) : error ? (
          <ErrorState
            title="Milestones Load Failed"
            message={error}
            onRetry={loadMilestones}
          />
        ) : milestones.length === 0 ? (
          <EmptyState
            title="No Milestones Found"
            description="No milestones match your active search or filter criteria."
            action={{
              label: "View All Projects",
              onClick: () => {
                setSelectedStatus("ALL");
                setSelectedStage("ALL");
                setSearchQuery("");
              },
            }}
          />
        ) : (
          <DataTable
            data={milestones}
            columns={columns}
            pageSize={10}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
