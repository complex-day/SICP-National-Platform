"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, KPICard, DataTable } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { academicService } from "@/services/academic.service";
import {
  AcademicKPIs,
  ChallengeAssignment,
  Faculty,
} from "@/features/academic/types/academic.types";
import {
  ChallengeAssignmentStatusBadge,
  FacultyAvailabilityBadge,
  AssignMentorModal,
  AssignDepartmentModal,
  FacultyProfileModal,
} from "@/features/academic/components";
import {
  GraduationCap,
  BookOpen,
  Users,
  FileCheck2,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AcademicDashboardPage() {
  const [kpis, setKpis] = useState<AcademicKPIs | null>(null);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeAssignment[]>([]);
  const [facultyWorkload, setFacultyWorkload] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [selectedFacultyForProfile, setSelectedFacultyForProfile] = useState<Faculty | null>(null);
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState<Faculty | null>(null);
  const [selectedAssignmentForDept, setSelectedAssignmentForDept] = useState<ChallengeAssignment | null>(null);
  const [isAssignMentorOpen, setIsAssignMentorOpen] = useState(false);
  const [isAssignDeptOpen, setIsAssignDeptOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [kpiRes, challengesRes, facultyRes] = await Promise.all([
        academicService.getKPIs(),
        academicService.listAssignedChallenges(),
        academicService.listFaculty(),
      ]);
      setKpis(kpiRes);
      setRecentChallenges(challengesRes.slice(0, 8));
      setFacultyWorkload(facultyRes.slice(0, 8));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load academic command center data.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActionSuccess = (message: string) => {
    setSuccessToast(message);
    loadData();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Columns for Recently Assigned Challenges
  const challengeColumns: ColumnDef<ChallengeAssignment>[] = [
    {
      key: "challengeTitle",
      header: "Challenge Title",
      sortable: true,
      render: (row: ChallengeAssignment) => (
        <div>
          <div className="font-semibold text-foreground text-sm line-clamp-1">
            {row.challengeTitle}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <span className="text-primary font-medium">{row.universityName}</span>
            {row.departmentName && (
              <span>• Dept: {row.departmentName}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (row: ChallengeAssignment) => (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
          {row.category}
        </span>
      ),
    },
    {
      key: "leadFacultyName",
      header: "Lead Faculty / PI",
      render: (row: ChallengeAssignment) => (
        <span className="text-xs font-medium text-foreground">
          {row.leadFacultyName || "Unassigned"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
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
      header: "Action",
      render: (row: ChallengeAssignment) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAssignmentForDept(row);
            setIsAssignDeptOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium transition-colors"
        >
          Assign Dept
        </button>
      ),
    },
  ];

  // Columns for Faculty Workload
  const facultyColumns: ColumnDef<Faculty>[] = [
    {
      key: "name",
      header: "Faculty Name",
      sortable: true,
      render: (row: Faculty) => (
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            {row.name}
            {row.activeMentorshipCount >= 3 && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded">
                CAP
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {row.designation} · {row.departmentName}
          </div>
        </div>
      ),
    },
    {
      key: "activeMentorshipCount",
      header: "Active Mentorships (Max 3)",
      sortable: true,
      render: (row: Faculty) => {
        const count = row.activeMentorshipCount;
        return (
          <div className="space-y-1 min-w-[120px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-foreground">{count} / 3</span>
              <span className="text-[10px] text-muted-foreground">
                {count === 3 ? "Max Reached" : `${3 - count} slot(s) left`}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  count === 1
                    ? "w-1/3 bg-emerald-500"
                    : count === 2
                    ? "w-2/3 bg-amber-500"
                    : "w-full bg-rose-500"
                }`}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "availability",
      header: "Availability",
      sortable: true,
      render: (row: Faculty) => (
        <FacultyAvailabilityBadge
          availability={row.availability}
          activeCount={row.activeMentorshipCount}
          showCount
        />
      ),
    },
    {
      key: "successRate",
      header: "Success Rate",
      sortable: true,
      render: (row: Faculty) => (
        <span className="font-mono text-xs font-semibold text-emerald-400">
          {row.successRate || 92}%
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row: Faculty) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedFacultyForProfile(row)}
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            Profile
          </button>
          <button
            disabled={row.activeMentorshipCount >= 3}
            onClick={() => {
              setSelectedFacultyForAssign(row);
              setIsAssignMentorOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-all"
          >
            Assign
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Academic Command Center & HEI Analytics..." />
      </DashboardLayout>
    );
  }

  if (error || !kpis) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Command Center Unavailable"
          message={error || "Could not retrieve academic collaboration records."}
          onRetry={loadData}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
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
          title="Academic Command Center"
          description="Higher Education Institution (HEI) collaboration layer, faculty mentorship allocation, and R&D intake management."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academic Hub", href: "/dashboard/academic" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              HEI Layer (M4)
            </span>
          }
          actions={
            <Link
              href="/academic/matching"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Mentor Matching
            </Link>
          }
        />

        {/* 4 Core Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Assigned Challenges"
            value={kpis.totalAssignedChallenges}
            subtitle="Intake challenges across universities"
            trend={{ value: 14.2, direction: "up", isPositive: true }}
            icon={BookOpen}
            accentColor="brand"
          />
          <KPICard
            title="Active Faculty Mentors"
            value={kpis.activeFacultyMentors}
            subtitle="PIs with concurrent student teams"
            trend={{ value: 8.5, direction: "up", isPositive: true }}
            icon={GraduationCap}
            accentColor="emerald"
          />
          <KPICard
            title="Active Student Teams"
            value={kpis.activeStudentTeams}
            subtitle="Engaged in multidisciplinary R&D"
            trend={{ value: 18.0, direction: "up", isPositive: true }}
            icon={Users}
            accentColor="blue"
          />
          <KPICard
            title="Solution Proposals"
            value={kpis.solutionProposalsSubmitted}
            subtitle="Peer-reviewed technical blueprints"
            trend={{ value: 24.5, direction: "up", isPositive: true }}
            icon={FileCheck2}
            accentColor="amber"
          />
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/academic/challenges"
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Challenge Intake Catalog</h4>
                <p className="text-xs text-muted-foreground">Claim & route broadcast problems</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/academic/faculty"
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Faculty Directory</h4>
                <p className="text-xs text-muted-foreground">Workload caps & specialization</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/academic/matching"
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">AI Mentorship Engine</h4>
                <p className="text-xs text-muted-foreground">5-factor explainable recommendation</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Table 1: Recently Assigned Challenges */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Recently Assigned Challenges
              </h3>
              <p className="text-xs text-muted-foreground">
                Active problem statements routed to institutional academic departments
              </p>
            </div>
            <Link
              href="/academic/challenges"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            data={recentChallenges}
            columns={challengeColumns}
            searchKey="challengeTitle"
            searchPlaceholder="Filter assigned challenges..."
            pageSize={5}
            onRowClick={(row) => {
              setSelectedAssignmentForDept(row);
              setIsAssignDeptOpen(true);
            }}
          />
        </div>

        {/* Table 2: Faculty Workload & Mentorship Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Faculty Mentorship Workload & Capacity
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time monitoring of the strict 3-team capacity constraint across departments
              </p>
            </div>
            <Link
              href="/academic/faculty"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Full Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            data={facultyWorkload}
            columns={facultyColumns}
            searchKey="name"
            searchPlaceholder="Filter faculty by name or department..."
            pageSize={5}
            onRowClick={(row) => setSelectedFacultyForProfile(row)}
          />
        </div>
      </div>

      {/* Modals */}
      <FacultyProfileModal
        isOpen={Boolean(selectedFacultyForProfile)}
        onClose={() => setSelectedFacultyForProfile(null)}
        faculty={selectedFacultyForProfile}
        onAssignMentor={(fac) => {
          setSelectedFacultyForAssign(fac);
          setIsAssignMentorOpen(true);
        }}
      />

      <AssignMentorModal
        isOpen={isAssignMentorOpen}
        onClose={() => setIsAssignMentorOpen(false)}
        onSuccess={handleActionSuccess}
        preselectedFaculty={selectedFacultyForAssign}
      />

      <AssignDepartmentModal
        isOpen={isAssignDeptOpen}
        onClose={() => setIsAssignDeptOpen(false)}
        onSuccess={handleActionSuccess}
        assignment={selectedAssignmentForDept}
      />
    </DashboardLayout>
  );
}
