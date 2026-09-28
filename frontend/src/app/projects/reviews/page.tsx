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
import { FacultyReview } from "@/features/project/types/project.types";
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GraduationCap,
  ArrowRight,
  Sliders,
  Sparkles,
} from "lucide-react";

type EnrichedReview = FacultyReview & {
  projectTitle: string;
  teamName: string;
  category: string;
};

const STATUSES: { label: string; value: string }[] = [
  { label: "All Review Outcomes", value: "ALL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Revision Requested", value: "REVISION_REQUESTED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function FacultyReviewsPage() {
  const [reviews, setReviews] = useState<EnrichedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.listAllReviews({
        search: searchQuery,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      });
      setReviews(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load reviews.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  const avgScore =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.totalScore, 0) / reviews.length
        ).toFixed(1)
      : "0";

  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;
  const revisionsCount = reviews.filter((r) => r.status === "REVISION_REQUESTED").length;

  const columns: ColumnDef<EnrichedReview>[] = [
    {
      key: "projectTitle",
      header: "Project Title & Category",
      sortable: true,
      render: (row: EnrichedReview) => (
        <div className="max-w-[300px]">
          <div className="font-semibold text-foreground text-sm line-clamp-1">
            {row.projectTitle}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            Team: <span className="text-foreground font-medium">{row.teamName}</span> · {row.category}
          </div>
        </div>
      ),
    },
    {
      key: "reviewerName",
      header: "Faculty Reviewer",
      sortable: true,
      render: (row: EnrichedReview) => (
        <div className="text-xs">
          <div className="font-medium text-foreground flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
            {row.reviewerName}
          </div>
          <div className="text-muted-foreground text-[11px]">
            {row.reviewerInstitution}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Outcome",
      sortable: true,
      render: (row: EnrichedReview) => {
        const isAppr = row.status === "APPROVED";
        const isRev = row.status === "REVISION_REQUESTED";
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isAppr
                ? "bg-emerald-50 text-[#166534] border-emerald-300"
                : isRev
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-rose-50 text-rose-800 border-rose-300"
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: "totalScore",
      header: "Rubric Score",
      sortable: true,
      render: (row: EnrichedReview) => (
        <div className="text-xs">
          <div className="font-mono font-bold text-primary text-sm">
            {row.totalScore} / 100
          </div>
          <div className="text-[10px] text-muted-foreground">
            Inn:{row.rubric.innovationFeasibility} Pro:{row.rubric.prototypeMaturity} Val:{row.rubric.fieldValidation} Doc:{row.rubric.technicalDocumentation}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Evaluation Date",
      sortable: true,
      render: (row: EnrichedReview) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row: EnrichedReview) => (
        <Link
          href={`/projects/${row.projectId}`}
          className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <PageHeader
          title="Faculty Review & Quality Governance System"
          description="Evaluation rubrics, technical feasibility scores, and verification sign-offs across innovation project milestones."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects", href: "/projects" },
            { label: "Reviews", href: "/projects/reviews" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300">
              Quality Governance
            </span>
          }
          actions={
            <Link
              href="/projects"
              className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-2 transition-all"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            title="Average Evaluation Score"
            value={`${avgScore} / 100`}
            subtitle="Across 4-part statutory rubric"
            icon={Award}
            accentColor="brand"
          />
          <KPICard
            title="Approved Milestones"
            value={approvedCount}
            subtitle="Sign-offs granted by PIs"
            icon={CheckCircle2}
            accentColor="emerald"
          />
          <KPICard
            title="Revisions Requested"
            value={revisionsCount}
            subtitle="Under iterative R&D refinement"
            icon={AlertTriangle}
            accentColor="amber"
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
                placeholder="Search reviews by project, reviewer, or comments..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs transition-all"
            >
              Search Reviews
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E2E8F0]">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[#475569] font-medium">Outcome:</span>
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

            {/* Clear Filters */}
            {(selectedStatus !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus("ALL");
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
          <LoadingState message="Loading faculty evaluation logs..." />
        ) : error ? (
          <ErrorState
            title="Reviews Load Failed"
            message={error}
            onRetry={loadReviews}
          />
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No Evaluation Records Found"
            description="No faculty reviews match your active filter criteria."
            action={{
              label: "Reset Search",
              onClick: () => {
                setSelectedStatus("ALL");
                setSearchQuery("");
              },
            }}
          />
        ) : (
          <DataTable
            data={reviews}
            columns={columns}
            pageSize={10}
            onRowClick={(row) => {}}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
