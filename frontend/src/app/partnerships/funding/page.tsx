"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { partnershipService } from "@/services/partnership.service";
import {
  FundingTranche,
  IndustryKPIs,
} from "@/features/partnership/types/partnership.types";
import {
  FundingReleaseModal,
} from "@/features/partnership/components";
import {
  IndianRupee,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck2,
} from "lucide-react";

type FlatTranche = FundingTranche & {
  partnerName: string;
  projectTitle: string;
  category: string;
};

export default function FundingTrancheManagerPage() {
  const [tranches, setTranches] = useState<FlatTranche[]>([]);
  const [kpis, setKpis] = useState<IndustryKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal
  const [selectedTrancheForRelease, setSelectedTrancheForRelease] = useState<{
    tranche: FundingTranche;
    partnerName: string;
    projectTitle: string;
  } | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [trancheRes, kpiRes] = await Promise.all([
        partnershipService.listAllFundingTranches(),
        partnershipService.getKPIs(),
      ]);
      setTranches(trancheRes);
      setKpis(kpiRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load funding tranches.";
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

  const filteredTranches = useMemo(() => {
    return tranches.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesPartner = t.partnerName.toLowerCase().includes(q);
        const matchesProject = t.projectTitle.toLowerCase().includes(q);
        const matchesMilestone = t.linkedMilestoneTitle.toLowerCase().includes(q);
        if (!matchesPartner && !matchesProject && !matchesMilestone) return false;
      }

      if (selectedStatus !== "ALL" && t.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [tranches, searchQuery, selectedStatus]);

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  const columns: ColumnDef<FlatTranche>[] = [
    {
      key: "partnerName",
      header: "CSR Partner & Project",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{row.partnerName}</span>
          </div>
          <Link
            href={`/partnerships/${row.partnershipId}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1 mt-0.5"
          >
            {row.projectTitle}
          </Link>
        </div>
      ),
    },
    {
      key: "trancheNumber",
      header: "Tranche",
      sortable: true,
      render: (row) => (
        <span className="font-bold text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border">
          #{row.trancheNumber}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Grant Amount",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs font-bold text-foreground">
          ₹{row.amount.toLocaleString("en-IN")}
          <div className="text-[10px] text-muted-foreground font-normal">
            ({(row.amount / 100000).toFixed(1)}L)
          </div>
        </div>
      ),
    },
    {
      key: "linkedMilestoneTitle",
      header: "Linked M5 Milestone & Audit Criteria",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-medium text-foreground text-xs line-clamp-1">
            {row.linkedMilestoneTitle}
          </div>
          <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
            Req: {row.evidenceRequired}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const isReleased = row.status === "RELEASED";
        const isEligible = row.status === "ELIGIBLE";
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              isReleased
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : isEligible
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {isReleased && <CheckCircle2 className="h-3 w-3" />}
            {isEligible && <ShieldCheck className="h-3 w-3" />}
            <span>{row.status}</span>
          </span>
        );
      },
    },
    {
      key: "id",
      header: "Action",
      render: (row) => {
        const isReleased = row.status === "RELEASED";
        const isEligible = row.status === "ELIGIBLE";

        if (isReleased) {
          return (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Disbursed
            </span>
          );
        }

        if (isEligible) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTrancheForRelease({
                  tranche: row,
                  partnerName: row.partnerName,
                  projectTitle: row.projectTitle,
                });
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Release
            </button>
          );
        }

        return (
          <span className="text-[11px] text-muted-foreground">
            Milestone Pending
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Funding Tranche Manager & CSR Ledger..." />
      </DashboardLayout>
    );
  }

  if (error || !kpis) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Funding Manager Unavailable"
          message={error || "Could not retrieve funding tranche records."}
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
          title="CSR Funding Tranche Manager"
          description="Milestone-linked funding tranche authorizations, utilization certificate validation, and schedule VII audit compliance."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Industry Network", href: "/dashboard/industry" },
            { label: "Funding Manager", href: "/partnerships/funding" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Audit & Tranches
            </span>
          }
        />

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Committed Capital
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">
              {formatLakhs(kpis.totalCSRFundingCommitted)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across active industry partnerships
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Total Disbursed Capital
            </span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {formatLakhs(kpis.totalCSRFundingDisbursed)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.fundingUtilizationPercentage}% of total committed grants
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Eligible for Release
            </span>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              {tranches.filter((t) => t.status === "ELIGIBLE").length} Tranches
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting CSR Bureau authorization
            </p>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Committed (Future)
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">
              {tranches.filter((t) => t.status === "COMMITTED").length} Tranches
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Linked to upcoming M5 milestones
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-border flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by partner, project, or milestone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3" />
              Status:
            </span>
            {["ALL", "ELIGIBLE", "RELEASED", "COMMITTED"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedStatus === status
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {status === "ALL" ? "All Tranches" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Tranches */}
        <div className="space-y-4">
          <DataTable
            data={filteredTranches}
            columns={columns}
            searchKey="partnerName"
            searchPlaceholder="Filter tranches..."
            pageSize={8}
          />
        </div>
      </div>

      {/* Release Modal */}
      <FundingReleaseModal
        isOpen={Boolean(selectedTrancheForRelease)}
        onClose={() => setSelectedTrancheForRelease(null)}
        onSuccess={handleActionSuccess}
        tranche={selectedTrancheForRelease?.tranche || null}
        partnerName={selectedTrancheForRelease?.partnerName || ""}
        projectTitle={selectedTrancheForRelease?.projectTitle || ""}
      />
    </DashboardLayout>
  );
}
