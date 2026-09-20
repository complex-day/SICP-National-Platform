"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { academicService } from "@/services/academic.service";
import {
  ChallengeAssignment,
  ChallengeAssignmentStatus,
} from "@/features/academic/types/academic.types";
import {
  ChallengeAssignmentStatusBadge,
  AssignDepartmentModal,
  ClaimChallengeModal,
} from "@/features/academic/components";
import {
  Search,
  Filter,
  GraduationCap,
  Plus,
  Eye,
} from "lucide-react";

const CATEGORIES = [
  "All Categories",
  "Water Conservation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Infrastructure",
  "Waste Management",
  "Clean Energy",
  "Smart Cities",
];

const STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Intake Pending", value: "INTAKE_PENDING" },
  { label: "Claimed", value: "CLAIMED" },
  { label: "Dept Assigned", value: "DEPARTMENT_ASSIGNED" },
  { label: "Active Research", value: "ACTIVE_RESEARCH" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function AcademicChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals
  const [selectedAssignmentForDept, setSelectedAssignmentForDept] =
    useState<ChallengeAssignment | null>(null);
  const [isAssignDeptOpen, setIsAssignDeptOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedChallengeToClaim, setSelectedChallengeToClaim] = useState<{
    id: string;
    title: string;
    category: string;
  } | null>(null);

  const loadChallenges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await academicService.listAssignedChallenges({
        search: searchQuery,
        category: selectedCategory === "All Categories" ? undefined : selectedCategory,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      });
      setChallenges(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load academic challenges catalog.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadChallenges();
  };

  const handleActionSuccess = (message: string) => {
    setSuccessToast(message);
    loadChallenges();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const columns: ColumnDef<ChallengeAssignment>[] = [
    {
      key: "challengeTitle",
      header: "Challenge Title & Institution",
      sortable: true,
      render: (row: ChallengeAssignment) => (
        <div className="max-w-[340px]">
          <div className="font-semibold text-foreground text-sm line-clamp-1">
            {row.challengeTitle}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span className="text-primary font-medium">{row.universityName}</span>
            {row.departmentName && (
              <span className="text-muted-foreground">· Dept: {row.departmentName}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Domain Category",
      sortable: true,
      render: (row: ChallengeAssignment) => (
        <span className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
          {row.category}
        </span>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      sortable: true,
      render: (row: ChallengeAssignment) => {
        const u = row.urgency;
        const color =
          u === "CRITICAL"
            ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
            : u === "HIGH"
            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
            : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${color}`}
          >
            {u}
          </span>
        );
      },
    },
    {
      key: "leadFacultyName",
      header: "Lead Faculty / PI",
      render: (row: ChallengeAssignment) => (
        <div className="text-xs">
          {row.leadFacultyName ? (
            <span className="font-medium text-foreground flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              {row.leadFacultyName}
            </span>
          ) : (
            <span className="italic text-muted-foreground">Unassigned PI</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Intake Status",
      sortable: true,
      render: (row: ChallengeAssignment) => (
        <ChallengeAssignmentStatusBadge status={row.status} />
      ),
    },
    {
      key: "proposalsCount",
      header: "Proposals",
      sortable: true,
      render: (row: ChallengeAssignment) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {row.proposalsCount}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row: ChallengeAssignment) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/challenges`)}
            title="Review Original Problem Statement"
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Review
          </button>

          {row.status === "INTAKE_PENDING" ? (
            <button
              onClick={() => {
                setSelectedChallengeToClaim({
                  id: row.challengeId,
                  title: row.challengeTitle,
                  category: row.category,
                });
                setIsClaimModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-semibold transition-colors"
            >
              Claim
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedAssignmentForDept(row);
                setIsAssignDeptOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all"
            >
              Assign Dept
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-between shadow-glow animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-emerald-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="University Challenge Intake Catalog"
          description="HEI institutional problem routing, challenge adoption, and department-level R&D assignment."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academic Hub", href: "/dashboard/academic" },
            { label: "Challenges", href: "/academic/challenges" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              HEI Intake Portal
            </span>
          }
          actions={
            <button
              onClick={() => {
                setSelectedChallengeToClaim({
                  id: `chal-${Date.now()}`,
                  title: "Smart Rural Water Supply & Quality Monitoring",
                  category: "Water Conservation",
                });
                setIsClaimModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Claim New Challenge
            </button>
          }
        />

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challenges by title, university, department, or faculty PI..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow transition-all"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedCategory !== "All Categories" ||
              selectedStatus !== "ALL" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All Categories");
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
          <LoadingState message="Loading intake catalog & institutional assignments..." />
        ) : error ? (
          <ErrorState
            title="Intake Catalog Failed"
            message={error}
            onRetry={loadChallenges}
          />
        ) : challenges.length === 0 ? (
          <EmptyState
            title="No Assigned Challenges Found"
            description="No challenges match your active search or filter criteria. Try resetting filters or claim a new challenge."
            action={{
              label: "Claim Challenge",
              onClick: () => setIsClaimModalOpen(true),
            }}
          />
        ) : (
          <DataTable
            data={challenges}
            columns={columns}
            pageSize={10}
            onRowClick={(row) => {
              setSelectedAssignmentForDept(row);
              setIsAssignDeptOpen(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      <AssignDepartmentModal
        isOpen={isAssignDeptOpen}
        onClose={() => setIsAssignDeptOpen(false)}
        onSuccess={handleActionSuccess}
        assignment={selectedAssignmentForDept}
      />

      <ClaimChallengeModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={handleActionSuccess}
        challengeId={selectedChallengeToClaim?.id}
        challengeTitle={selectedChallengeToClaim?.title}
        category={selectedChallengeToClaim?.category}
      />
    </DashboardLayout>
  );
}
