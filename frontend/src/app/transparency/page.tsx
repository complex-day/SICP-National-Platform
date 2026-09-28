"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState, KPICard } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { governanceService } from "@/services/governance.service";
import {
  PublicAuditEntry,
  NationalKPIs,
} from "@/features/governance/types/governance.types";
import {
  Sha256VerificationModal,
} from "@/features/governance/components";
import {
  Lock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Copy,
  Check,
  FileCheck,
  ExternalLink,
  Sparkles,
  Award,
  Users,
  IndianRupee,
  Layers,
} from "lucide-react";

export default function PublicTransparencyPortalPage() {
  const [ledger, setLedger] = useState<PublicAuditEntry[]>([]);
  const [kpis, setKpis] = useState<NationalKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("ALL");

  // Modal
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedDigestForModal, setSelectedDigestForModal] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [ledgerRes, kpiRes] = await Promise.all([
        governanceService.getPublicAuditLedger(),
        governanceService.getNationalKPIs(),
      ]);
      setLedger(ledgerRes);
      setKpis(kpiRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load public audit ledger.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.entityTitle.toLowerCase().includes(q);
        const matchesEvent = item.eventType.toLowerCase().includes(q);
        const matchesDigest = item.sha256Digest.toLowerCase().includes(q);
        const matchesActor = item.actorRole.toLowerCase().includes(q);
        if (!matchesTitle && !matchesEvent && !matchesDigest && !matchesActor) return false;
      }

      if (selectedModule !== "ALL" && item.sourceModule !== selectedModule) {
        return false;
      }

      return true;
    });
  }, [ledger, searchQuery, selectedModule]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const columns: ColumnDef<PublicAuditEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp (UTC)",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.timestamp).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
          <div className="text-[10px] opacity-80">
            {new Date(row.timestamp).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "eventType",
      header: "Governance Event",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground text-xs flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
              {row.sourceModule}
            </span>
            <span>{row.eventType.replace(/_/g, " ")}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            Actor: {row.actorRole}
          </div>
        </div>
      ),
    },
    {
      key: "entityTitle",
      header: "Mutated Entity & Summary",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-medium text-foreground text-xs line-clamp-1">
            {row.entityTitle}
          </div>
          <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
            {row.metadataSummary}
          </div>
        </div>
      ),
    },
    {
      key: "sha256Digest",
      header: "Cryptographic SHA-256 Digest",
      render: (row) => {
        const shortHash = `${row.sha256Digest.slice(0, 10)}...${row.sha256Digest.slice(-8)}`;
        const isCopied = copiedHash === row.sha256Digest;

        return (
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20 transition-colors"
              onClick={() => {
                setSelectedDigestForModal(row.sha256Digest);
                setIsVerifyModalOpen(true);
              }}
              title="Click to verify cryptographic digest"
            >
              {shortHash}
            </span>

            <button
              onClick={() => handleCopyHash(row.sha256Digest)}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Copy Full Hash"
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      key: "isVerified",
      header: "Integrity",
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <ShieldCheck className="h-3 w-3" />
          <span>Verified Block</span>
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
            setSelectedDigestForModal(row.sha256Digest);
            setIsVerifyModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
        >
          Verify
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Public Transparency Portal & Immutable Audit Ledger..." />
      </DashboardLayout>
    );
  }

  if (error || !kpis) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Transparency Portal Unavailable"
          message={error || "Could not retrieve public audit records."}
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
          title="Public Transparency & Audit Portal"
          description="Open-access national public ledger with cryptographically chained SHA-256 audit logs guaranteeing zero-tampering and citizen oversight."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Transparency Portal", href: "/transparency" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Open Data Verified
            </span>
          }
          actions={
            <button
              onClick={() => {
                setSelectedDigestForModal("");
                setIsVerifyModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-2 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Verify SHA-256 Digest
            </button>
          }
        />

        {/* Public Statistics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Public Audit Records"
            value={kpis.publicAuditRecordsCount.toLocaleString("en-IN")}
            subtitle="Immutable chained blocks"
            icon={Lock}
            accentColor="brand"
            trend={{ value: "100% Intact", direction: "neutral" }}
          />

          <KPICard
            title="Civic Challenges"
            value={kpis.totalChallenges.toLocaleString("en-IN")}
            subtitle={`${kpis.resolvedChallenges} Verified Resolved`}
            icon={Layers}
            accentColor="emerald"
            trend={{ value: `${kpis.resolutionRate}% Rate`, direction: "up", isPositive: true }}
          />

          <KPICard
            title="Active R&D Teams"
            value={kpis.activeStudentTeams}
            subtitle={`${kpis.activeProjects} Active Projects`}
            icon={Users}
            accentColor="blue"
            trend={{ value: "+48 this month", direction: "up", isPositive: true }}
          />

          <KPICard
            title="Public CSR Disbursed"
            value={formatLakhs(kpis.totalCSRCapitalDisbursed)}
            subtitle={`Out of ${formatLakhs(kpis.totalCSRCapitalCommitted)}`}
            icon={IndianRupee}
            accentColor="amber"
            trend={{ value: "Audited", direction: "neutral" }}
          />

          <KPICard
            title="Societal SROI Yield"
            value={`${kpis.averageSROIRatio}x`}
            subtitle={`${(kpis.verifiedBeneficiaries / 1000000).toFixed(2)}M Beneficiaries`}
            icon={Award}
            accentColor="emerald"
            trend={{ value: "High Impact", direction: "up", isPositive: true }}
          />
        </div>

        {/* Cryptographic Ledger Info Banner */}
        <div className="bg-[#EEF2F7] p-5 rounded-xl border border-[#CBD5E1] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#0F172A] text-sm">
              <ShieldCheck className="h-5 w-5 text-[#166534]" />
              <span>Cryptographic Proof & Immutability Guarantee</span>
            </div>
            <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
              Every citizen problem submission, university team allocation, milestone approval, and CSR grant disbursement is cryptographically hashed with its preceding block digest to guarantee an immutable historical audit chain.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedDigestForModal(ledger[0]?.sha256Digest || "");
              setIsVerifyModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Lock className="h-3.5 w-3.5 text-[#166534]" />
            <span>Verify Latest Block</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit ledger by title, hash, event, or role..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              />
            </div>
          </div>

          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-[#475569] mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3 text-[#166534]" />
              Source Module:
            </span>
            {[
              { id: "ALL", label: "All Modules" },
              { id: "M1", label: "M1: IAM" },
              { id: "M2", label: "M2: Challenges" },
              { id: "M3", label: "M3: Teams" },
              { id: "M4", label: "M4: Academic" },
              { id: "M5", label: "M5: Projects" },
              { id: "M6", label: "M6: CSR Industry" },
              { id: "M7", label: "M7: Governance" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                  selectedModule === m.id
                    ? "bg-[#166534] text-white font-bold shadow-xs"
                    : "bg-[#EEF2F7] text-[#475569] border border-[#E2E8F0] font-medium hover:text-[#0F172A] hover:bg-[#E2E8F0]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Ledger Table */}
        <div className="space-y-4">
          <DataTable
            data={filteredLedger}
            columns={columns}
            searchKey="entityTitle"
            searchPlaceholder="Filter audit records..."
            pageSize={8}
            onRowClick={(row) => {
              setSelectedDigestForModal(row.sha256Digest);
              setIsVerifyModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* SHA256 Verification Modal */}
      <Sha256VerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        prefilledDigest={selectedDigestForModal}
      />
    </DashboardLayout>
  );
}
