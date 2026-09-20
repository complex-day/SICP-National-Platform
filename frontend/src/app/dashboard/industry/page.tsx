"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { partnershipService } from "@/services/partnership.service";
import {
  IndustryKPIs,
  Partnership,
  FundingTranche,
} from "@/features/partnership/types/partnership.types";
import {
  IndustryKPICards,
  PartnershipStatusBadge,
  SponsorshipProposalModal,
  FundingReleaseModal,
} from "@/features/partnership/components";
import {
  Handshake,
  IndianRupee,
  Users,
  Compass,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  ExternalLink,
} from "lucide-react";

export default function IndustryDashboardPage() {
  const [kpis, setKpis] = useState<IndustryKPIs | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [pendingTranches, setPendingTranches] = useState<
    (FundingTranche & { partnerName: string; projectTitle: string; category: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedTrancheForRelease, setSelectedTrancheForRelease] = useState<{
    tranche: FundingTranche;
    partnerName: string;
    projectTitle: string;
  } | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [kpiRes, partRes, tranchesRes] = await Promise.all([
        partnershipService.getKPIs(),
        partnershipService.listPartnerships(),
        partnershipService.listAllFundingTranches({ status: "ELIGIBLE" }),
      ]);
      setKpis(kpiRes);
      setPartnerships(partRes);
      setPendingTranches(tranchesRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load industry dashboard data.";
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

  // Format currency in Lakhs/Cr
  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  // Columns for Active Partnerships
  const partnershipColumns: ColumnDef<Partnership>[] = [
    {
      key: "partnerName",
      header: "Partner & Entity",
      sortable: true,
      render: (row: Partnership) => (
        <div>
          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{row.partnerName}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {row.contactPerson} • {row.partnerType.replace(/_/g, " ")}
          </div>
        </div>
      ),
    },
    {
      key: "projectTitle",
      header: "Sponsored Innovation Project",
      sortable: true,
      render: (row: Partnership) => (
        <div className="max-w-xs">
          <Link
            href={`/partnerships/${row.id}`}
            className="font-medium text-foreground text-xs hover:text-primary transition-colors line-clamp-1"
          >
            {row.projectTitle}
          </Link>
          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="text-primary font-medium">{row.institutionName}</span>
            <span>• {row.teamName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "projectCategory",
      header: "Category",
      sortable: true,
      render: (row: Partnership) => (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
          {row.projectCategory}
        </span>
      ),
    },
    {
      key: "totalCommittedFunding",
      header: "CSR Committed",
      sortable: true,
      render: (row: Partnership) => (
        <div>
          <div className="font-mono text-xs font-bold text-foreground">
            {formatLakhs(row.totalCommittedFunding)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {formatLakhs(row.totalReleasedFunding)} Disbursed
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row: Partnership) => <PartnershipStatusBadge status={row.status} />,
    },
    {
      key: "id",
      header: "Action",
      render: (row: Partnership) => (
        <Link
          href={`/partnerships/${row.id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
        >
          <span>Workspace</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      ),
    },
  ];

  // Columns for Pending Tranches
  const trancheColumns: ColumnDef<
    FundingTranche & { partnerName: string; projectTitle: string; category: string }
  >[] = [
    {
      key: "partnerName",
      header: "CSR Partner & Project",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground text-xs">{row.partnerName}</div>
          <div className="text-[11px] text-muted-foreground line-clamp-1">{row.projectTitle}</div>
        </div>
      ),
    },
    {
      key: "linkedMilestoneTitle",
      header: "Linked M5 Milestone",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-medium text-foreground text-xs line-clamp-1">
            {row.linkedMilestoneTitle}
          </div>
          <div className="text-[10px] text-muted-foreground line-clamp-1">{row.evidenceRequired}</div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Tranche Value",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs font-bold text-emerald-500">
          ₹{row.amount.toLocaleString("en-IN")}
          <div className="text-[10px] text-muted-foreground font-normal">
            Tranche #{row.trancheNumber}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Audit Check",
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <ShieldCheck className="h-3 w-3" />
          Milestone Verified
        </span>
      ),
    },
    {
      key: "id",
      header: "Action",
      render: (row) => (
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
          <IndianRupee className="h-3 w-3" />
          Release Tranche
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Industry Partnership Command Center..." />
      </DashboardLayout>
    );
  }

  if (error || !kpis) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Industry Network Unavailable"
          message={error || "Could not retrieve industry partnership records."}
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
          title="Industry Partnership Command Center"
          description="Corporate CSR sponsorship network, milestone-linked funding tranches, senior mentorship advisory, and field testbed deployments."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Industry Network", href: "/dashboard/industry" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Module 6 • Industry Hub
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/partnerships"
                className="px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-muted border border-border flex items-center gap-1.5 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-primary" />
                Discovery Marketplace
              </Link>

              <button
                onClick={() => setIsProposalModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Propose CSR Sponsorship
              </button>
            </div>
          }
        />

        {/* 5 Core KPI Widgets */}
        <IndustryKPICards kpis={kpis} />

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/partnerships"
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">Discovery Marketplace</h4>
                <p className="text-[11px] text-muted-foreground">Browse R&D Projects</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/partnerships/funding"
            className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">Tranche Manager</h4>
                <p className="text-[11px] text-muted-foreground">Milestone-Linked Releases</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/partnerships/mentorship"
            className="p-4 rounded-xl bg-card border border-border hover:border-purple-500/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">Mentorship Hub</h4>
                <p className="text-[11px] text-muted-foreground">Advisory Hours & Logs</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/partnerships/deployments"
            className="p-4 rounded-xl bg-card border border-border hover:border-amber-500/40 transition-all duration-300 group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">Pilot Testbeds</h4>
                <p className="text-[11px] text-muted-foreground">Field Deployments & Telemetry</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Table 1: Active Corporate CSR Partnerships */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Active Industry & CSR Partnerships
              </h3>
              <p className="text-xs text-muted-foreground">
                Formal MoUs, grant agreements, and commercialization programs
              </p>
            </div>
            <Link
              href="/partnerships"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            data={partnerships}
            columns={partnershipColumns}
            searchKey="partnerName"
            searchPlaceholder="Filter partnerships by company name..."
            pageSize={5}
          />
        </div>

        {/* Table 2: Pending Milestone-Linked Funding Tranches */}
        {pendingTranches.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Eligible Milestone-Linked Funding Tranches</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tranches where technical deliverables have met completion criteria and await CSR disbursement
                </p>
              </div>
              <Link
                href="/partnerships/funding"
                className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1"
              >
                Tranche Manager <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <DataTable
              data={pendingTranches}
              columns={trancheColumns}
              searchKey="partnerName"
              searchPlaceholder="Filter eligible tranches..."
              pageSize={5}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <SponsorshipProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSuccess={handleActionSuccess}
      />

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
