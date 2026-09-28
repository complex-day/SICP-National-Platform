"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { projectService } from "@/services/project.service";
import { partnershipService } from "@/services/partnership.service";
import { Project, ProjectStage } from "@/features/project/types/project.types";
import { Partnership } from "@/features/partnership/types/partnership.types";
import { ProjectStageBadge } from "@/features/project/components/ProjectStageBadge";
import {
  SponsorshipProposalModal,
  PartnershipStatusBadge,
} from "@/features/partnership/components";
import {
  Search,
  Filter,
  Sparkles,
  Building2,
  IndianRupee,
  Cpu,
  ArrowRight,
  Compass,
  Layers,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Users,
  Grid,
  List,
} from "lucide-react";

export default function ProjectDiscoveryMarketplacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [selectedFundingRange, setSelectedFundingRange] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Modal state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedProjectForSponsorship, setSelectedProjectForSponsorship] = useState<{
    id: string;
    title: string;
    category: string;
    teamName: string;
    institutionName: string;
  } | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [projRes, partRes] = await Promise.all([
        projectService.listProjects(),
        partnershipService.listPartnerships(),
      ]);
      setProjects(projRes);
      setPartnerships(partRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load project discovery marketplace.";
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

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSyn = p.synopsis.toLowerCase().includes(q);
        const matchesInst = p.facultyMentorInstitution.toLowerCase().includes(q);
        const matchesTeam = p.teamName.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSyn && !matchesInst && !matchesTeam && !matchesCat) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
        return false;
      }

      // Stage
      if (selectedStage !== "ALL" && p.stage !== selectedStage) {
        return false;
      }

      // Funding Range
      if (selectedFundingRange !== "ALL") {
        const budget = p.budgetAllocated || 0;
        if (selectedFundingRange === "UNDER_10L" && budget > 1000000) return false;
        if (selectedFundingRange === "10L_25L" && (budget < 1000000 || budget > 2500000)) return false;
        if (selectedFundingRange === "25L_PLUS" && budget < 2500000) return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedCategory, selectedStage, selectedFundingRange]);

  // Categories list
  const categories = [
    "ALL",
    "Water Conservation",
    "Healthcare",
    "Education",
    "Agriculture",
    "Infrastructure",
    "Waste Management",
    "Clean Energy",
  ];

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  // Check if project has an existing CSR partner
  const getExistingPartnership = (projectId: string) => {
    return partnerships.find((p) => p.projectId === projectId);
  };

  // Columns for Table View
  const tableColumns: ColumnDef<Project>[] = [
    {
      key: "title",
      header: "Project & University",
      sortable: true,
      render: (row: Project) => (
        <div className="max-w-xs">
          <Link
            href={`/projects/${row.id}`}
            className="font-semibold text-foreground text-sm hover:text-primary transition-colors line-clamp-1"
          >
            {row.title}
          </Link>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="text-primary font-medium">{row.facultyMentorInstitution}</span>
            <span>• {row.teamName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (row: Project) => (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
          {row.category}
        </span>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      sortable: true,
      render: (row: Project) => <ProjectStageBadge stage={row.stage} />,
    },
    {
      key: "budgetAllocated",
      header: "Funding Required",
      sortable: true,
      render: (row: Project) => (
        <div className="font-mono text-xs font-bold text-foreground">
          {formatLakhs(row.budgetAllocated || 0)}
        </div>
      ),
    },
    {
      key: "id",
      header: "CSR Status",
      render: (row: Project) => {
        const part = getExistingPartnership(row.id);
        if (part) {
          return (
            <Link
              href={`/partnerships/${part.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 hover:underline"
            >
              <Building2 className="h-3 w-3" />
              <span>{part.partnerName}</span>
            </Link>
          );
        }
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Open for Sponsoring
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Action",
      render: (row: Project) => {
        const part = getExistingPartnership(row.id);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedProjectForSponsorship({
                  id: row.id,
                  title: row.title,
                  category: row.category,
                  teamName: row.teamName,
                  institutionName: row.facultyMentorInstitution,
                });
                setIsProposalModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-sm transition-all"
            >
              Sponsor
            </button>
            {part ? (
              <Link
                href={`/partnerships/${part.id}`}
                className="p-1 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                title="View Partnership Hub"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href={`/projects/${row.id}`}
                className="p-1 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                title="View Project Lifecycle"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Project Discovery Marketplace..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Marketplace Unavailable"
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

        {/* Page Header */}
        <PageHeader
          title="Project Discovery Marketplace"
          description="Browse student & faculty R&D innovations ready for Corporate CSR sponsorship, field testbeds, and technology commercialization."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Industry Network", href: "/dashboard/industry" },
            { label: "Discovery Marketplace", href: "/partnerships" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300">
              M5 + M6 Marketplace
            </span>
          }
          actions={
            <button
              onClick={() => {
                setSelectedProjectForSponsorship(null);
                setIsProposalModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create CSR Sponsorship Proposal
            </button>
          }
        />

        {/* Search and Filters Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-border space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, team, university, or keyword..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            {/* Filter Dropdowns & View Mode */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {/* Stage Filter */}
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="ALL">All Stages</option>
                <option value="PROPOSAL">Proposal Stage</option>
                <option value="DEVELOPMENT">Development Stage</option>
                <option value="PILOT">Field Pilot Stage</option>
                <option value="COMPLETED">Completed Stage</option>
              </select>

              {/* Funding Range Filter */}
              <select
                value={selectedFundingRange}
                onChange={(e) => setSelectedFundingRange(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="ALL">All Funding Brackets</option>
                <option value="UNDER_10L">Under ₹10 Lakhs</option>
                <option value="10L_25L">₹10L - ₹25 Lakhs</option>
                <option value="25L_PLUS">₹25 Lakhs +</option>
              </select>

              {/* Grid / Table Toggle */}
              <div className="flex items-center border border-border rounded-xl p-0.5 bg-background">
                <button
                  onClick={() => setViewMode("GRID")}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === "GRID"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("TABLE")}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === "TABLE"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table View"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
              <Filter className="h-3 w-3" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat === "ALL" ? "All Domains" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Marketplace Content */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            title="No Matching Projects Found"
            description="Try adjusting your search criteria, category filters, or funding range brackets."
          />
        ) : viewMode === "GRID" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const part = getExistingPartnership(project.id);
              const crl = part ? part.techTransfer.commercializationReadinessLevel : 4;

              return (
                <div
                  key={project.id}
                  className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between hover:border-primary/50 transition-all duration-200 group"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border">
                        {project.category}
                      </span>
                      <ProjectStageBadge stage={project.stage} />
                    </div>

                    {/* Title */}
                    <Link
                      href={part ? `/partnerships/${part.id}` : `/projects/${project.id}`}
                      className="font-bold text-foreground text-base tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 block"
                    >
                      {project.title}
                    </Link>

                    {/* Synopsis */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {project.synopsis}
                    </p>

                    {/* Meta: Institution & Team */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs mb-4">
                      <div className="flex items-center gap-1.5 text-foreground font-medium truncate">
                        <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{project.facultyMentorInstitution}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                        <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          {project.teamName} (Lead: {project.teamLeadName})
                        </span>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Funding Target
                        </div>
                        <div className="text-sm font-bold text-foreground mt-0.5">
                          {formatLakhs(project.budgetAllocated || 0)}
                        </div>
                      </div>

                      <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Readiness (CRL)
                        </div>
                        <div className="text-sm font-bold text-primary mt-0.5">
                          CRL {crl} / 9
                        </div>
                      </div>
                    </div>

                    {/* Existing CSR Partner tag */}
                    {part && (
                      <div className="mb-4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Partnered with {part.partnerName}
                        </span>
                        <PartnershipStatusBadge status={part.status} />
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedProjectForSponsorship({
                          id: project.id,
                          title: project.title,
                          category: project.category,
                          teamName: project.teamName,
                          institutionName: project.facultyMentorInstitution,
                        });
                        setIsProposalModalOpen(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Sponsor Project
                    </button>

                    {part ? (
                      <Link
                        href={`/partnerships/${part.id}`}
                        className="py-2 px-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/projects/${project.id}`}
                        className="py-2 px-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable
              data={filteredProjects}
              columns={tableColumns}
              searchKey="title"
              searchPlaceholder="Filter projects..."
              pageSize={8}
            />
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      <SponsorshipProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => {
          setIsProposalModalOpen(false);
          setSelectedProjectForSponsorship(null);
        }}
        onSuccess={handleActionSuccess}
        defaultProject={selectedProjectForSponsorship || undefined}
      />
    </DashboardLayout>
  );
}
