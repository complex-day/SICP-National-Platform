"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { governanceService } from "@/services/governance.service";
import {
  DistrictDIRIScorecard,
} from "@/features/governance/types/governance.types";
import {
  DIRITierBadge,
  DistrictScorecardModal,
} from "@/features/governance/components";
import {
  MapPin,
  Award,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  Users,
  FolderGit2,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function DistrictRankingsPage() {
  const [districts, setDistricts] = useState<DistrictDIRIScorecard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");

  // Modal
  const [selectedDistrictForModal, setSelectedDistrictForModal] =
    useState<DistrictDIRIScorecard | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await governanceService.listDistrictRankings();
      setDistricts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load district DIRI rankings.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic
  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.districtName.toLowerCase().includes(q);
        const matchesState = d.stateName.toLowerCase().includes(q);
        const matchesDomain = d.topDomain.toLowerCase().includes(q);
        if (!matchesName && !matchesState && !matchesDomain) return false;
      }

      if (selectedTier !== "ALL" && d.tier !== selectedTier) {
        return false;
      }

      if (selectedState !== "ALL" && d.stateName !== selectedState) {
        return false;
      }

      return true;
    });
  }, [districts, searchQuery, selectedTier, selectedState]);

  // Unique states
  const statesList = useMemo(() => {
    const set = new Set<string>();
    districts.forEach((d) => set.add(d.stateName));
    return ["ALL", ...Array.from(set)];
  }, [districts]);

  // Aggregate metrics
  const avgDiri =
    districts.length > 0
      ? (districts.reduce((acc, d) => acc + d.diriScore, 0) / districts.length).toFixed(1)
      : "82.4";

  const tier1Count = districts.filter((d) => d.tier === "TIER_1_EXCELLENCE").length;

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const columns: ColumnDef<DistrictDIRIScorecard>[] = [
    {
      key: "ranking",
      header: "Rank",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          #{row.ranking}
        </span>
      ),
    },
    {
      key: "districtName",
      header: "District & State",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            <span>{row.districtName}</span>
          </div>
          <div className="text-xs text-muted-foreground">{row.stateName}</div>
        </div>
      ),
    },
    {
      key: "resolutionRate",
      header: "Resolution Rate",
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>{row.resolutionRate}%</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              {row.resolvedChallenges}/{row.totalChallenges}
            </span>
          </div>
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${row.resolutionRate}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "activeProjects",
      header: "R&D Projects & Teams",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-foreground">
            {row.activeProjects} Projects
          </span>
          <div className="text-[10px] text-muted-foreground">
            {row.activeStudentTeams} Student Teams
          </div>
        </div>
      ),
    },
    {
      key: "totalCSRCommitted",
      header: "CSR Capital",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs font-bold text-emerald-400">
          {formatLakhs(row.totalCSRCommitted)}
          <div className="text-[10px] text-muted-foreground font-normal">
            {row.verifiedBeneficiaries.toLocaleString("en-IN")} reach
          </div>
        </div>
      ),
    },
    {
      key: "diriScore",
      header: "DIRI Index",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.diriScore} / 100
        </span>
      ),
    },
    {
      key: "tier",
      header: "Performance Tier",
      sortable: true,
      render: (row) => <DIRITierBadge tier={row.tier} />,
    },
    {
      key: "districtCode",
      header: "Action",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDistrictForModal(row);
          }}
          className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
        >
          Full Scorecard
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading District Innovation & Resolution Index (DIRI)..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="DIRI Index Unavailable"
          message={error}
          onRetry={loadData}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard/government"
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Government Command
          </Link>
        </div>

        {/* Page Header */}
        <PageHeader
          title="District Innovation & Resolution Index (DIRI)"
          description="Standardized composite index benchmarking civic problem resolution speed, academic team density, and CSR sponsorship penetration across districts."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Government", href: "/dashboard/government" },
            { label: "DIRI Rankings", href: "/dashboard/government/districts" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300">
              DIRI Scorecards
            </span>
          }
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
              Monitored Districts
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {districts.length} Districts
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Indexed with real-time telemetry rollups
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
              Tier 1 Excellence
            </span>
            <div className="text-2xl font-bold text-[#166534] mt-1">
              {tier1Count} Districts
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Resolution rates exceeding 70%
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              National Average DIRI
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {avgDiri} / 100
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Composite mathematical index
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Total Resolved Problems
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {districts.reduce((acc, d) => acc + d.resolvedChallenges, 0)} Challenges
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified civic handovers completed
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-border space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search district, state, or top focus domain..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3" />
              DIRI Tier:
            </span>
            {[
              { id: "ALL", label: "All Tiers" },
              { id: "TIER_1_EXCELLENCE", label: "Tier 1: Excellence" },
              { id: "TIER_2_PROGRESSIVE", label: "Tier 2: Progressive" },
              { id: "TIER_3_ASPIRATIONAL", label: "Tier 3: Aspirational" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedTier === t.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* DIRI Table */}
        <div className="space-y-4">
          <DataTable
            data={filteredDistricts}
            columns={columns}
            searchKey="districtName"
            searchPlaceholder="Filter districts..."
            pageSize={8}
            onRowClick={(row) => setSelectedDistrictForModal(row)}
          />
        </div>
      </div>

      {/* Scorecard Modal */}
      <DistrictScorecardModal
        isOpen={Boolean(selectedDistrictForModal)}
        onClose={() => setSelectedDistrictForModal(null)}
        district={selectedDistrictForModal}
      />
    </DashboardLayout>
  );
}
