"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { governanceService } from "@/services/governance.service";
import { StatePerformanceSnapshot } from "@/features/governance/types/governance.types";
import {
  Compass,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  GraduationCap,
  Award,
  IndianRupee,
  Users,
  TrendingUp,
} from "lucide-react";

export default function StatePerformancePage() {
  const [states, setStates] = useState<StatePerformanceSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await governanceService.listStateRankings();
      setStates(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load state performance snapshots.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStates = useMemo(() => {
    return states.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.stateName.toLowerCase().includes(q);
        const matchesCode = s.stateCode.toLowerCase().includes(q);
        if (!matchesName && !matchesCode) return false;
      }

      if (selectedRegion !== "ALL" && s.region !== selectedRegion) {
        return false;
      }

      return true;
    });
  }, [states, searchQuery, selectedRegion]);

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const columns: ColumnDef<StatePerformanceSnapshot>[] = [
    {
      key: "ranking",
      header: "Rank",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          #{row.ranking}
        </span>
      ),
    },
    {
      key: "stateName",
      header: "State / UT",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>{row.stateName}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {row.districtsCount} Districts • Region: {row.region}
          </div>
        </div>
      ),
    },
    {
      key: "resolutionRate",
      header: "Problem Resolution Rate",
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
      key: "universitiesCount",
      header: "Participating HEIs",
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-foreground">{row.universitiesCount} Universities</span>
          <div className="text-[10px] text-muted-foreground">{row.activeProjects} Active Projects</div>
        </div>
      ),
    },
    {
      key: "totalCSRDeployed",
      header: "CSR Capital Deployed",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs font-bold text-foreground">
          {formatLakhs(row.totalCSRDeployed)}
          <div className="text-[10px] text-muted-foreground font-normal">
            {row.verifiedBeneficiaries.toLocaleString("en-IN")} reach
          </div>
        </div>
      ),
    },
    {
      key: "averageSROI",
      header: "Average SROI",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          {row.averageSROI}x
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading State Geo Rollup & Regional Disparities..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="State Performance Unavailable"
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
          title="State Performance & Geo Rollup"
          description="Macro-level regional analytics measuring state-by-state challenge intake, HEI university involvement, and CSR funding utilization."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Government", href: "/dashboard/government" },
            { label: "State Performance", href: "/dashboard/government/states" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Geo Heatmaps
            </span>
          }
        />

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Participating States
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">
              {states.length} States / UTs
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Covering 238+ administrative districts
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Top Performing State
            </span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {states[0]?.stateName || "Maharashtra"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {states[0]?.resolutionRate || 73.1}% Resolution Rate
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total CSR Deployed
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">
              {formatLakhs(states.reduce((acc, s) => acc + s.totalCSRDeployed, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Directly funding grassroots R&D
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              National SROI Multiplier
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">
              {(states.reduce((acc, s) => acc + s.averageSROI, 0) / (states.length || 1)).toFixed(2)}x
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all state ecosystems
            </p>
          </div>
        </div>

        {/* Search & Region Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-border space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state name or state code..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          {/* Region Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3" />
              Region:
            </span>
            {[
              { id: "ALL", label: "All Regions" },
              { id: "WEST", label: "West" },
              { id: "SOUTH", label: "South" },
              { id: "NORTH", label: "North" },
              { id: "EAST", label: "East" },
              { id: "CENTRAL", label: "Central" },
              { id: "NORTH_EAST", label: "North East" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedRegion === r.id
                    ? "bg-emerald-600 text-white font-semibold shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* States Table */}
        <div className="space-y-4">
          <DataTable
            data={filteredStates}
            columns={columns}
            searchKey="stateName"
            searchPlaceholder="Filter states..."
            pageSize={8}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
