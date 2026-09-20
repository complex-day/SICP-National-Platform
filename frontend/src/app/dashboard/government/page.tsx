"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, KPICard, DataTable } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { governanceService } from "@/services/governance.service";
import {
  NationalKPIs,
  DomainDistribution,
  InnovationFunnelStage,
  DistrictDIRIScorecard,
  ProjectSROIReport,
} from "@/features/governance/types/governance.types";
import {
  InnovationFunnelVisualizer,
  DomainDistributionChart,
  SROIBenefitCard,
  DIRITierBadge,
  DistrictScorecardModal,
} from "@/features/governance/components";
import {
  Landmark,
  Flag,
  Award,
  Users,
  GraduationCap,
  Building2,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Compass,
  MapPin,
  Lock,
} from "lucide-react";

export default function GovernmentDashboardPage() {
  const [kpis, setKpis] = useState<NationalKPIs | null>(null);
  const [domains, setDomains] = useState<DomainDistribution[]>([]);
  const [funnel, setFunnel] = useState<InnovationFunnelStage[]>([]);
  const [topDistricts, setTopDistricts] = useState<DistrictDIRIScorecard[]>([]);
  const [sroiReports, setSroiReports] = useState<ProjectSROIReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [selectedDistrictForModal, setSelectedDistrictForModal] =
    useState<DistrictDIRIScorecard | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [kpiRes, domainRes, funnelRes, distRes, sroiRes] = await Promise.all([
        governanceService.getNationalKPIs(),
        governanceService.getDomainDistributions(),
        governanceService.getInnovationFunnel(),
        governanceService.listDistrictRankings(),
        governanceService.listProjectSROIReports(),
      ]);
      setKpis(kpiRes);
      setDomains(domainRes);
      setFunnel(funnelRes);
      setTopDistricts(distRes.slice(0, 5));
      setSroiReports(sroiRes.slice(0, 4));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load governance intelligence.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const districtColumns: ColumnDef<DistrictDIRIScorecard>[] = [
    {
      key: "ranking",
      header: "Rank",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
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
      header: "Active R&D",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {row.activeProjects} Proj ({row.activeStudentTeams} Teams)
        </span>
      ),
    },
    {
      key: "diriScore",
      header: "DIRI Score",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.diriScore} / 100
        </span>
      ),
    },
    {
      key: "tier",
      header: "Index Tier",
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
          className="px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted text-xs font-semibold border border-border transition-colors"
        >
          Scorecard
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading National Governance Command Center & Impact Intelligence..." />
      </DashboardLayout>
    );
  }

  if (error || !kpis) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Governance Command Unavailable"
          message={error || "Could not retrieve national governance records."}
          onRetry={loadData}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Page Header */}
        <PageHeader
          title="National Governance & Impact Intelligence"
          description="Ministry & Inter-Agency Command Center: macro-level societal returns, cross-district innovation indexes, HEI participation, and immutable public audit ledgers."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Government Command", href: "/dashboard/government" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Module 7 • Macro Command
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/transparency"
                className="px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-muted border border-border flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-primary" />
                Public Transparency Portal
              </Link>
            </div>
          }
        />

        {/* National 6-KPI Macro Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <KPICard
            title="Total Challenges"
            value={kpis.totalChallenges.toLocaleString("en-IN")}
            subtitle={`${kpis.resolvedChallenges} Resolved (${kpis.resolutionRate}%)`}
            icon={Flag}
            accentColor="brand"
            trend={{ value: "+18% MoM", direction: "up", isPositive: true }}
          />

          <KPICard
            title="Active R&D Projects"
            value={kpis.activeProjects}
            subtitle={`${kpis.activeStudentTeams} Student Teams`}
            icon={Award}
            accentColor="emerald"
            trend={{ value: "+32 New", direction: "up", isPositive: true }}
          />

          <KPICard
            title="Participating HEIs"
            value={kpis.universitiesParticipating}
            subtitle="Tier 1 & State Universities"
            icon={GraduationCap}
            accentColor="purple"
            trend={{ value: "100% Onboarded", direction: "neutral" }}
          />

          <KPICard
            title="CSR Capital"
            value={formatLakhs(kpis.totalCSRCapitalCommitted)}
            subtitle={`${formatLakhs(kpis.totalCSRCapitalDisbursed)} Disbursed`}
            icon={IndianRupee}
            accentColor="amber"
            trend={{ value: "61.1% Payout", direction: "up", isPositive: true }}
          />

          <KPICard
            title="Beneficiaries"
            value={(kpis.verifiedBeneficiaries / 1000000).toFixed(2) + "M"}
            subtitle="Citizens Reached"
            icon={Users}
            accentColor="blue"
            trend={{ value: "+240k", direction: "up", isPositive: true }}
          />

          <KPICard
            title="Societal SROI"
            value={`${kpis.averageSROIRatio}x`}
            subtitle={`${kpis.deploymentSuccessRate}% Pilot Success`}
            icon={TrendingUp}
            accentColor="emerald"
            trend={{ value: "₹4.85 per ₹1", direction: "up", isPositive: true }}
          />
        </div>

        {/* Quick Navigation Cards to Drill-Downs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/government/districts"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">DIRI District Index</h4>
                <p className="text-[11px] text-muted-foreground">Rankings & Disparities</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/dashboard/government/states"
            className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">State Geo Rollup</h4>
                <p className="text-[11px] text-muted-foreground">Regional Performance</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/dashboard/government/universities"
            className="p-4 rounded-xl bg-card border border-border hover:border-purple-500/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">UPI University Index</h4>
                <p className="text-[11px] text-muted-foreground">Academic Research ROI</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/dashboard/government/sponsors"
            className="p-4 rounded-xl bg-card border border-border hover:border-amber-500/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">SRI Sponsor Index</h4>
                <p className="text-[11px] text-muted-foreground">CSR Grant Reliability</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Innovation Funnel & Domain Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InnovationFunnelVisualizer stages={funnel} />
          <DomainDistributionChart domains={domains} />
        </div>

        {/* SROI Top Projects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                High-Impact SROI Exemplars
              </h3>
              <p className="text-xs text-muted-foreground">
                Verified Social Return on Investment valuations based on civic cost savings and beneficiary multiplier models
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sroiReports.map((report) => (
              <SROIBenefitCard key={report.projectId} report={report} />
            ))}
          </div>
        </div>

        {/* DIRI Rankings Snippet Table */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                National DIRI Rankings (Top Districts)
              </h3>
              <p className="text-xs text-muted-foreground">
                District Innovation & Resolution Index scorecard measuring problem clearance, team density, and sponsor coverage
              </p>
            </div>
            <Link
              href="/dashboard/government/districts"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Full District Leaderboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            data={topDistricts}
            columns={districtColumns}
            searchKey="districtName"
            searchPlaceholder="Filter districts..."
            pageSize={5}
            onRowClick={(row) => setSelectedDistrictForModal(row)}
          />
        </div>
      </div>

      {/* District Scorecard Modal */}
      <DistrictScorecardModal
        isOpen={Boolean(selectedDistrictForModal)}
        onClose={() => setSelectedDistrictForModal(null)}
        district={selectedDistrictForModal}
      />
    </DashboardLayout>
  );
}
