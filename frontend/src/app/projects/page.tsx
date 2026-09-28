"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, KPICard, DataTable } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { projectService } from "@/services/project.service";
import {
  Project,
  ProjectKPIs,
  ProjectStage,
} from "@/features/project/types/project.types";
import {
  ProjectStageBadge,
  ProjectCard,
} from "@/features/project/components";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Cpu,
  Rocket,
  CheckCircle2,
  FileText,
  LayoutGrid,
  List,
  Users,
  GraduationCap,
  Calendar,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const STAGES = [
  { label: "All Stages", value: "ALL" },
  { label: "Proposal", value: "PROPOSAL" },
  { label: "Development", value: "DEVELOPMENT" },
  { label: "Pilot", value: "PILOT" },
  { label: "Completed", value: "COMPLETED" },
];

const CATEGORIES = [
  "All Categories",
  "Water Conservation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Infrastructure",
  "Clean Energy",
  "Smart Cities",
];

export default function ProjectsRegistryPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<ProjectKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [projData, kpiData] = await Promise.all([
        projectService.listProjects({
          search: searchQuery,
          stage: selectedStage === "ALL" ? undefined : selectedStage,
          category: selectedCategory === "All Categories" ? undefined : selectedCategory,
        }),
        projectService.getKPIs(),
      ]);
      setProjects(projData);
      setKpis(kpiData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load project registry.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const columns: ColumnDef<Project>[] = [
    {
      key: "title",
      header: "Project Title & Linked Challenge",
      sortable: true,
      render: (row: Project) => (
        <div className="max-w-[320px]">
          <Link
            href={`/projects/${row.id}`}
            className="font-semibold text-foreground text-sm hover:text-primary transition-colors line-clamp-1"
          >
            {row.title}
          </Link>
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            Challenge: {row.challengeTitle}
          </div>
        </div>
      ),
    },
    {
      key: "teamName",
      header: "Student Team",
      sortable: true,
      render: (row: Project) => (
        <div className="text-xs">
          <div className="font-medium text-foreground flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            {row.teamName}
          </div>
          <div className="text-muted-foreground text-[11px]">
            Lead: {row.teamLeadName} ({row.teamMembersCount} members)
          </div>
        </div>
      ),
    },
    {
      key: "facultyMentorName",
      header: "Faculty Mentor",
      render: (row: Project) => (
        <div className="text-xs">
          <div className="font-medium text-foreground flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-[#166534]" />
            {row.facultyMentorName}
          </div>
          <div className="text-muted-foreground text-[11px]">
            {row.facultyMentorInstitution}
          </div>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Current Stage",
      sortable: true,
      render: (row: Project) => <ProjectStageBadge stage={row.stage} />,
    },
    {
      key: "progressPercentage",
      header: "Progress",
      sortable: true,
      render: (row: Project) => (
        <div className="space-y-1 min-w-[100px]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-primary">
              {row.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${row.progressPercentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "id",
      header: "Action",
      render: (row: Project) => (
        <Link
          href={`/projects/${row.id}`}
          className="px-2.5 py-1 rounded-lg bg-[#166534] text-white hover:bg-[#14532D] text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <PageHeader
          title="Innovation Project Lifecycle Workspace"
          description="Registry of active multidisciplinary R&D solutions advancing through Proposal, Development, Pilot, and Handover stages."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Projects", href: "/projects" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300">
              Module 5 Lifecycle
            </span>
          }
          actions={
            <div className="flex items-center gap-2.5">
              <Link
                href="/projects/milestones"
                className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] transition-colors"
              >
                Milestone Hub
              </Link>
              <Link
                href="/projects/reviews"
                className="px-3.5 py-2 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] transition-colors"
              >
                Faculty Reviews
              </Link>
              <Link
                href="/projects/create"
                className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-2 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Project
              </Link>
            </div>
          }
        />

        {/* 4 KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Active Projects"
              value={kpis.totalProjects}
              subtitle="Registered R&D solutions"
              icon={Layers}
              accentColor="brand"
            />
            <KPICard
              title="In Development"
              value={kpis.inDevelopment}
              subtitle="Prototyping & CAD testing"
              icon={Cpu}
              accentColor="blue"
            />
            <KPICard
              title="In Field Pilot"
              value={kpis.inPilot}
              subtitle="Live municipal / rural trials"
              icon={Rocket}
              accentColor="purple"
            />
            <KPICard
              title="Completed / Deployed"
              value={kpis.completed}
              subtitle="Commercialized solutions"
              icon={CheckCircle2}
              accentColor="emerald"
            />
          </div>
        )}

        {/* Search, Filter & View Toggle Bar */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, team, mentor, tags, or challenge..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] transition-colors"
              />
            </form>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                  viewMode === "GRID"
                    ? "bg-[#166534] text-white border-[#166534] shadow-xs"
                    : "bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                  viewMode === "TABLE"
                    ? "bg-[#166534] text-white border-[#166534] shadow-xs"
                    : "bg-white border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E2E8F0]">
            {/* Stage Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#166534]" />
              <span className="text-[#475569] font-medium">Stage:</span>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              >
                {STAGES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#475569] font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedStage !== "ALL" ||
              selectedCategory !== "All Categories" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStage("ALL");
                  setSelectedCategory("All Categories");
                  setSearchQuery("");
                }}
                className="text-xs text-primary font-semibold hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content View */}
        {isLoading ? (
          <LoadingState message="Loading innovation project lifecycle registry..." />
        ) : error ? (
          <ErrorState
            title="Project Registry Failed"
            message={error}
            onRetry={loadData}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No Projects Found"
            description="No innovation projects match your active search or stage filter. Try resetting your criteria or create a new project."
            action={{
              label: "Create Project",
              onClick: () => router.push("/projects/create"),
            }}
          />
        ) : viewMode === "GRID" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <DataTable
            data={projects}
            columns={columns}
            pageSize={10}
            onRowClick={(row) => router.push(`/projects/${row.id}`)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
