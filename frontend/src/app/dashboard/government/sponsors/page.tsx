"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { governanceService } from "@/services/governance.service";
import { SponsorSRIScorecard } from "@/features/governance/types/governance.types";
import {
  SRITierBadge,
  SponsorScorecardModal,
} from "@/features/governance/components";
import {
  Building2,
  Award,
  Search,
  Filter,
  ArrowLeft,
  Download,
  IndianRupee,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function SponsorRankingsPage() {
  const [sponsors, setSponsors] = useState<SponsorSRIScorecard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  // Modal
  const [selectedSponsorForModal, setSelectedSponsorForModal] =
    useState<SponsorSRIScorecard | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await governanceService.listSponsorRankings();
      setSponsors(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sponsor SRI rankings.";
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

  const filteredSponsors = useMemo(() => {
    return sponsors.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = s.companyName.toLowerCase().includes(q);
        const matchesComp = s.complianceRating.toLowerCase().includes(q);
        if (!matchesName && !matchesComp) return false;
      }

      if (selectedTier !== "ALL" && s.tier !== selectedTier) {
        return false;
      }

      if (selectedType !== "ALL" && s.partnerType !== selectedType) {
        return false;
      }

      return true;
    });
  }, [sponsors, searchQuery, selectedTier, selectedType]);

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const avgSri =
    sponsors.length > 0
      ? (sponsors.reduce((acc, s) => acc + s.sriScore, 0) / sponsors.length).toFixed(1)
      : "93.5";

  const columns: ColumnDef<SponsorSRIScorecard>[] = [
    {
      key: "ranking",
      header: "Rank",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          #{row.ranking}
        </span>
      ),
    },
    {
      key: "companyName",
      header: "Industry Partner / CSR Trust",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>{row.companyName}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {row.partnerType.replace(/_/g, " ")} • <span className="text-emerald-400 font-medium">{row.complianceRating}</span>
          </div>
        </div>
      ),
    },
    {
      key: "committedFunds",
      header: "CSR Capital Commitment",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs">
          <span className="font-bold text-foreground">{formatLakhs(row.committedFunds)}</span>
          <div className="text-[10px] text-emerald-400 font-semibold">
            {formatLakhs(row.releasedFunds)} Disbursed ({row.utilizationPercentage}%)
          </div>
        </div>
      ),
    },
    {
      key: "onTimeDisbursementsCount",
      header: "Tranche Reliability",
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-foreground">
            {row.onTimeDisbursementsCount}/{row.scheduledTranchesCount} On-Time
          </span>
          <div className="text-[10px] text-muted-foreground">
            {row.activeProjectsSponsored} Active Projects
          </div>
        </div>
      ),
    },
    {
      key: "mentorshipHoursDelivered",
      header: "Advisory Hours",
      sortable: true,
      render: (row) => (
        <div className="text-xs font-mono font-bold text-foreground">
          {row.mentorshipHoursDelivered} hrs
        </div>
      ),
    },
    {
      key: "sriScore",
      header: "SRI Score",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#166534]">
          {row.sriScore} / 100
        </span>
      ),
    },
    {
      key: "tier",
      header: "Reliability Tier",
      sortable: true,
      render: (row) => <SRITierBadge tier={row.tier} />,
    },
    {
      key: "partnerId",
      header: "Action",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSponsorForModal(row);
          }}
          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#166534] border border-emerald-200 text-xs font-semibold transition-colors"
        >
          Scorecard
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Sponsor Reliability Index (SRI) Rankings..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="SRI Rankings Unavailable"
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
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-[#166534] text-sm font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-[#14532D]"
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
          title="Sponsor Reliability Index (SRI)"
          description="Institutional benchmark measuring corporate CSR capital fulfillment, tranche disbursement timeliness, technical mentorship delivery, and MCA Schedule VII compliance."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Government", href: "/dashboard/government" },
            { label: "SRI Rankings", href: "/dashboard/government/sponsors" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300">
              MCA CSR-1 Certified
            </span>
          }
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
              Top Reliable Partner
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1 line-clamp-1">
              {sponsors[0]?.companyName || "Tata Trust"}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              SRI Score: {sponsors[0]?.sriScore || 98.4}/100
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              National Average SRI
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {avgSri} / 100
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              High-trust corporate grant rating
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Total Committed Capital
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {formatLakhs(sponsors.reduce((acc, s) => acc + s.committedFunds, 0))}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {formatLakhs(sponsors.reduce((acc, s) => acc + s.releasedFunds, 0))} Verified & Disbursed
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Advisory Hours Delivered
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {sponsors.reduce((acc, s) => acc + s.mentorshipHoursDelivered, 0)} Hours
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Hands-on corporate research guidance
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
                placeholder="Search sponsor company or compliance rating..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              />
            </div>
          </div>

          {/* Tier Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-[#475569] mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3 text-[#166534]" />
              SRI Tier:
            </span>
            {[
              { id: "ALL", label: "All Tiers" },
              { id: "TIER_1_AAA", label: "Tier 1 (AAA)" },
              { id: "TIER_2_AA", label: "Tier 2 (AA)" },
              { id: "TIER_3_A", label: "Tier 3 (A)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                  selectedTier === t.id
                    ? "bg-[#166534] text-white font-bold shadow-xs"
                    : "bg-[#EEF2F7] text-[#475569] border border-[#E2E8F0] font-medium hover:text-[#0F172A] hover:bg-[#E2E8F0]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* SRI Table */}
        <div className="space-y-4">
          <DataTable
            data={filteredSponsors}
            columns={columns}
            searchKey="companyName"
            searchPlaceholder="Filter sponsors..."
            pageSize={8}
            onRowClick={(row) => setSelectedSponsorForModal(row)}
          />
        </div>
      </div>

      {/* Sponsor Scorecard Modal */}
      <SponsorScorecardModal
        isOpen={Boolean(selectedSponsorForModal)}
        onClose={() => setSelectedSponsorForModal(null)}
        sponsor={selectedSponsorForModal}
        onExportSuccess={handleActionSuccess}
      />
    </DashboardLayout>
  );
}
