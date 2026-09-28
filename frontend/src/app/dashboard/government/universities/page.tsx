"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { governanceService } from "@/services/governance.service";
import { UniversityUPIScorecard } from "@/features/governance/types/governance.types";
import {
  UPITierBadge,
  UniversityScorecardModal,
} from "@/features/governance/components";
import {
  GraduationCap,
  Award,
  Search,
  Filter,
  ArrowLeft,
  Download,
  Users,
  FolderGit2,
  IndianRupee,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function UniversityRankingsPage() {
  const [universities, setUniversities] = useState<UniversityUPIScorecard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");

  // Modal
  const [selectedUniversityForModal, setSelectedUniversityForModal] =
    useState<UniversityUPIScorecard | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await governanceService.listUniversityRankings();
      setUniversities(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load university UPI rankings.";
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
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const filteredUniversities = useMemo(() => {
    return universities.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.universityName.toLowerCase().includes(q);
        const matchesState = u.stateName.toLowerCase().includes(q);
        const matchesAccred = u.accreditationGrade.toLowerCase().includes(q);
        if (!matchesName && !matchesState && !matchesAccred) return false;
      }

      if (selectedTier !== "ALL" && u.tier !== selectedTier) {
        return false;
      }

      if (selectedState !== "ALL" && u.stateName !== selectedState) {
        return false;
      }

      return true;
    });
  }, [universities, searchQuery, selectedTier, selectedState]);

  const statesList = useMemo(() => {
    const set = new Set<string>();
    universities.forEach((u) => set.add(u.stateName));
    return ["ALL", ...Array.from(set)];
  }, [universities]);

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const avgUpi =
    universities.length > 0
      ? (universities.reduce((acc, u) => acc + u.upiScore, 0) / universities.length).toFixed(1)
      : "89.5";

  const totalPatents = universities.reduce((acc, u) => acc + u.patentsFiled, 0);

  const columns: ColumnDef<UniversityUPIScorecard>[] = [
    {
      key: "ranking",
      header: "Rank",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-[#EEF2F7] text-[#166534] border border-[#E2E8F0]">
          #{row.ranking}
        </span>
      ),
    },
    {
      key: "universityName",
      header: "Higher Education Institution",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-[#0F172A] text-sm flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-[#166534]" />
            <span>{row.universityName}</span>
          </div>
          <div className="text-xs text-[#64748B]">
            {row.stateName} • <span className="text-[#166534] font-medium">{row.accreditationGrade}</span>
          </div>
        </div>
      ),
    },
    {
      key: "claimedChallenges",
      header: "Intake & Teams",
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-[#0F172A]">
            {row.claimedChallenges} Claimed
          </span>
          <div className="text-[10px] text-[#64748B]">
            {row.allocatedTeams} Teams ({row.activeFacultyMentors} PIs)
          </div>
        </div>
      ),
    },
    {
      key: "activeProjects",
      header: "Projects & Milestones",
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-mono font-bold text-[#0F172A]">
            {row.activeProjects} Active ({row.completedProjects} Completed)
          </span>
          <div className="text-[10px] text-[#166534]">
            {row.approvedMilestones} Milestones Verified
          </div>
        </div>
      ),
    },
    {
      key: "totalFundingSecured",
      header: "Secured Funding",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs font-bold text-[#0F172A]">
          {formatLakhs(row.totalFundingSecured)}
          <div className="text-[10px] text-[#64748B] font-normal">
            {row.patentsFiled} Patents Filed
          </div>
        </div>
      ),
    },
    {
      key: "upiScore",
      header: "UPI Score",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#166534]">
          {row.upiScore} / 100
        </span>
      ),
    },
    {
      key: "tier",
      header: "Index Tier",
      sortable: true,
      render: (row) => <UPITierBadge tier={row.tier} />,
    },
    {
      key: "universityId",
      header: "Action",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUniversityForModal(row);
          }}
          className="px-2.5 py-1 rounded bg-[#EEF2F7] hover:bg-[#E2E8F0] text-[#166534] border border-[#E2E8F0] text-xs font-semibold transition-colors"
        >
          Scorecard
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading University Participation Index (UPI) Rankings..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="UPI Rankings Unavailable"
          message={error}
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
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-emerald-950"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/government"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#166534] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Government Command
          </Link>
        </div>

        {/* Page Header */}
        <PageHeader
          title="University Participation Index (UPI)"
          description="National institutional index evaluating problem claim velocity, milestone completion, faculty mentorship depth, and technology transfer outputs."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Government", href: "/dashboard/government" },
            { label: "UPI Rankings", href: "/dashboard/government/universities" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2F7] text-[#166534] border border-[#E2E8F0]">
              HEI Research Translation
            </span>
          }
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
              Participating HEIs
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {universities.length} Universities
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              IITs, NITs, State & Central Universities
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              National Average UPI
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {avgUpi} / 100
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Research translation composite score
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Patents & Inventions
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {totalPatents} Patents Filed
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Derived from grassroots citizen challenges
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Secured R&D Grants
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {formatLakhs(universities.reduce((acc, u) => acc + u.totalFundingSecured, 0))}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Attracted from CSR & national schemes
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university, state, or NAAC grade..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st === "ALL" ? "All States" : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tier Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-[#64748B] mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3" />
              UPI Tier:
            </span>
            {[
              { id: "ALL", label: "All Tiers" },
              { id: "PLATINUM", label: "Platinum" },
              { id: "GOLD", label: "Gold" },
              { id: "SILVER", label: "Silver" },
              { id: "BRONZE", label: "Bronze" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedTier === t.id
                    ? "bg-[#166534] text-white font-semibold shadow-xs"
                    : "bg-[#EEF2F7] text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* UPI Table */}
        <div className="space-y-4">
          <DataTable
            data={filteredUniversities}
            columns={columns}
            searchKey="universityName"
            searchPlaceholder="Filter universities..."
            pageSize={8}
            onRowClick={(row) => setSelectedUniversityForModal(row)}
          />
        </div>
      </div>

      {/* University Scorecard Modal */}
      <UniversityScorecardModal
        isOpen={Boolean(selectedUniversityForModal)}
        onClose={() => setSelectedUniversityForModal(null)}
        university={selectedUniversityForModal}
        onExportSuccess={handleActionSuccess}
      />
    </DashboardLayout>
  );
}
