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
  PilotDeployment,
  Partnership,
  DeploymentStatus,
  DEPLOYMENT_STATUSES,
} from "@/features/partnership/types/partnership.types";
import {
  DeploymentCard,
  PilotEvidenceModal,
  DeploymentStatusBadge,
} from "@/features/partnership/components";
import {
  Compass,
  MapPin,
  Activity,
  HardDrive,
  Users,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function PilotDeploymentCenterPage() {
  const [deployments, setDeployments] = useState<PilotDeployment[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal
  const [selectedDeploymentForEvidence, setSelectedDeploymentForEvidence] =
    useState<PilotDeployment | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [depRes, partRes] = await Promise.all([
        partnershipService.listAllDeployments(),
        partnershipService.listPartnerships(),
      ]);
      setDeployments(depRes);
      setPartnerships(partRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load pilot deployments.";
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

  // Filter deployments
  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLoc = d.locationName.toLowerCase().includes(q);
        const matchesDist = d.district.toLowerCase().includes(q);
        const matchesState = d.state.toLowerCase().includes(q);
        const matchesProj = d.projectTitle.toLowerCase().includes(q);
        if (!matchesLoc && !matchesDist && !matchesState && !matchesProj) return false;
      }

      if (selectedStatus !== "ALL" && d.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [deployments, searchQuery, selectedStatus]);

  // Aggregate metrics
  const totalInstalledUnits = deployments.reduce((acc, d) => acc + d.installedUnits, 0);
  const totalBeneficiaries = deployments.reduce((acc, d) => acc + d.beneficiariesCount, 0);
  const activeTelemetryCount = deployments.filter((d) => d.telemetryLiveUrl).length;

  // Flattened evidence list for table
  const allEvidenceFiles = useMemo(() => {
    return deployments.flatMap((d) =>
      d.evidenceFiles.map((f) => ({
        ...f,
        locationName: d.locationName,
        district: d.district,
        projectTitle: d.projectTitle,
        partnershipId: d.partnershipId,
      }))
    );
  }, [deployments]);

  // Evidence columns
  const evidenceColumns: ColumnDef<{
    id: string;
    title: string;
    type: "PHOTO" | "TELEMETRY_LOG" | "MOU_COPY" | "FIELD_SURVEY";
    url: string;
    uploadedAt: string;
    uploadedBy: string;
    locationName: string;
    district: string;
    projectTitle: string;
    partnershipId: string;
  }>[] = [
    {
      key: "title",
      header: "Evidence Document",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground text-xs">{row.title}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            By {row.uploadedBy} • {new Date(row.uploadedAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      ),
    },
    {
      key: "locationName",
      header: "Site Location",
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-foreground">{row.locationName}</span>
          <div className="text-[10px] text-muted-foreground">{row.district}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Category",
      sortable: true,
      render: (row) => (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border">
          {row.type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "url",
      header: "Artifact",
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>View File</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Pilot Deployment Center & Field Testbeds..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Deployment Center Unavailable"
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
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#166534] text-sm font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-[#14532D] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="Pilot Deployment Center"
          description="Real-world municipal & rural testbeds, edge telemetry streams, field evidence verification, and community impact tracking."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Industry Network", href: "/dashboard/industry" },
            { label: "Pilot Deployments", href: "/partnerships/deployments" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              Field Testbeds
            </span>
          }
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 bg-white">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Active Field Testbeds
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {deployments.length} Locations
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Across 5 States and Municipal Districts
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hardware Nodes Deployed
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalInstalledUnits} Units
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sensors, gateways, converters & test equipment
            </p>
          </div>

          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 bg-white">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
              Beneficiaries Reached
            </span>
            <div className="text-2xl font-bold text-[#166534] mt-1">
              {totalBeneficiaries.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Citizens directly impacted by pilot systems
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live Telemetry Streams
            </span>
            <div className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
              <span>{activeTelemetryCount} Live Feeds</span>
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Continuous IoT sensor health monitoring
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-border space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by testbed location, district, state..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3" />
              Status:
            </span>
            {["ALL", ...DEPLOYMENT_STATUSES].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedStatus === status
                    ? "bg-amber-600 text-white font-semibold shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {status === "ALL" ? "All Testbeds" : status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Deployments Grid */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-4">
            Field Testbeds ({filteredDeployments.length})
          </h3>

          {filteredDeployments.length === 0 ? (
            <EmptyState
              title="No Field Testbeds Found"
              description="Try adjusting your search criteria or deployment stage filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDeployments.map((deployment) => (
                <DeploymentCard
                  key={deployment.id}
                  deployment={deployment}
                  onUploadEvidence={(dep) => setSelectedDeploymentForEvidence(dep)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Evidence Verification Archive Table */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Verified Field Evidence Archive
              </h3>
              <p className="text-xs text-muted-foreground">
                Ground-truth photographs, telemetry logs, site agreements, and Gram Panchayat endorsements
              </p>
            </div>
          </div>

          <DataTable
            data={allEvidenceFiles}
            columns={evidenceColumns}
            searchKey="title"
            searchPlaceholder="Filter evidence documents..."
            pageSize={5}
          />
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {selectedDeploymentForEvidence && (
        <PilotEvidenceModal
          isOpen={Boolean(selectedDeploymentForEvidence)}
          onClose={() => setSelectedDeploymentForEvidence(null)}
          onSuccess={handleActionSuccess}
          partnershipId={selectedDeploymentForEvidence.partnershipId}
          deployment={selectedDeploymentForEvidence}
        />
      )}
    </DashboardLayout>
  );
}
