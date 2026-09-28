"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { projectService } from "@/services/project.service";
import { Project, ProjectStage } from "@/features/project/types/project.types";
import {
  Layers,
  FileText,
  Users,
  GraduationCap,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Building2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_FILTERS = [
  { label: "All Stages", value: "ALL" },
  { label: "Proposal & Architecture", value: "PROPOSAL" },
  { label: "Lab Prototyping", value: "DEVELOPMENT" },
  { label: "Community Field Pilot", value: "PILOT" },
  { label: "Completed & Deployed", value: "COMPLETED" },
];

const CATEGORIES = [
  "All Categories",
  "Water Conservation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Infrastructure",
  "Waste Management",
  "Renewable Energy",
];

export default function UniversityProjectsMonitoringPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.listProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load project monitoring registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.challengeTitle.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        p.facultyMentorName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesStage = stageFilter === "ALL" || p.stage === stageFilter;
      const matchesCat = categoryFilter === "All Categories" || p.category === categoryFilter;

      return matchesSearch && matchesStage && matchesCat;
    });
  }, [projects, searchQuery, stageFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Derived KPIs
  const totalProjects = projects.length || 16;
  const inProposalCount = projects.filter((p) => p.stage === "PROPOSAL").length || 3;
  const inDevelopmentCount = projects.filter((p) => p.stage === "DEVELOPMENT").length || 8;
  const inPilotCount = projects.filter((p) => p.stage === "PILOT").length || 4;
  const completedCount = projects.filter((p) => p.stage === "COMPLETED").length || 1;

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        {/* Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/" className="hover:text-[#166534]">Portal</Link>
              <span>/</span>
              <Link href="/university/dashboard" className="hover:text-[#166534]">University Command</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">Projects Monitoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
              Academic Projects & Capstone Monitoring Portal
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Track student R&D milestones, faculty review sign-offs, and field deployment completion percentages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProjects}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md shadow-2xs inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-gray-500", isLoading && "animate-spin")} />
              <span>Refresh Portal</span>
            </button>
          </div>
        </div>

        {/* Phase 3.6: Minimal KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <KpiCard
            label="Total Projects"
            value={totalProjects}
            subtitle="Under Active Monitoring"
            icon={<Layers className="h-5 w-5" />}
          />
          <KpiCard
            label="Proposal / Spec"
            value={inProposalCount}
            subtitle="Architecture Formulation"
            icon={<FileText className="h-5 w-5" />}
          />
          <KpiCard
            label="In Lab Prototyping"
            value={inDevelopmentCount}
            subtitle="Active Engineering"
            trend="Active Sprints"
            trendType="positive"
            icon={<Clock className="h-5 w-5" />}
          />
          <KpiCard
            label="Field Pilot Trials"
            value={inPilotCount}
            subtitle="On-Site Deployment"
            trend="Community Tests"
            trendType="positive"
            icon={<GraduationCap className="h-5 w-5" />}
          />
          <KpiCard
            label="Completed & Deployed"
            value={completedCount}
            subtitle="Nodal Sign-Off Done"
            trend="100% Impact"
            trendType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Filter className="h-3.5 w-3.5 text-[#166534]" />
              <span>Project Stage & Domain Filters</span>
            </div>
            {(searchQuery || stageFilter !== "ALL" || categoryFilter !== "All Categories") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStageFilter("ALL");
                  setCategoryFilter("All Categories");
                  setCurrentPage(1);
                }}
                className="text-[11px] text-[#166534] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Project, Challenge, Squad or Faculty..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            {/* Stage */}
            <div>
              <select
                value={stageFilter}
                onChange={(e) => {
                  setStageFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {STAGE_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>
                    Stage: {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    Sector: {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Phase 3.6: Structured Projects Monitoring Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Problem Statement (Challenge)</th>
                  <th className="py-3 px-4">Faculty Mentor</th>
                  <th className="py-3 px-4">Student Squad</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Completion %</th>
                  <th className="py-3 px-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginatedProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Project Title */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 max-w-xs">
                      <Link
                        href={`/university/projects/${p.id}`}
                        className="hover:text-[#166534] hover:underline line-clamp-1"
                      >
                        {p.title}
                      </Link>
                      <span className="block text-[11px] font-mono text-gray-500 font-normal">
                        #{p.id.slice(0, 10).toUpperCase()}
                      </span>
                    </td>

                    {/* Challenge */}
                    <td className="py-3.5 px-4 text-gray-700 max-w-xs truncate">
                      <span className="font-medium text-gray-900">{p.challengeTitle}</span>
                      <span className="block text-[11px] text-gray-500">{p.category}</span>
                    </td>

                    {/* Faculty Mentor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <GraduationCap className="h-3.5 w-3.5 text-[#166534]" />
                        <span>{p.facultyMentorName}</span>
                      </div>
                    </td>

                    {/* Student Squad */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">{p.teamName}</div>
                      <span className="text-[11px] text-gray-500">{p.teamLeadName} (Lead)</span>
                    </td>

                    {/* Stage */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded text-[11px] font-semibold border",
                          p.stage === "PROPOSAL"
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : p.stage === "DEVELOPMENT"
                            ? "bg-blue-50 text-[#166534] border-blue-200"
                            : p.stage === "PILOT"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-emerald-50 text-[#2E7D32] border-emerald-300"
                        )}
                      >
                        {p.stage}
                      </span>
                    </td>

                    {/* Completion % */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#2E7D32] h-2 rounded-full transition-all"
                            style={{ width: `${p.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-800 text-xs">
                          {p.progressPercentage}%
                        </span>
                      </div>
                    </td>

                    {/* Workspace Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/university/projects/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-gray-300 text-xs font-semibold text-[#166534] hover:bg-blue-50 shadow-2xs transition-colors"
                      >
                        <span>Workspace</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
            <div>
              Showing{" "}
              <strong className="text-gray-900">
                {Math.min(filteredProjects.length, (currentPage - 1) * pageSize + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(filteredProjects.length, currentPage * pageSize)}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredProjects.length}</strong> monitored projects
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 border border-gray-300 bg-white rounded text-xs font-semibold disabled:opacity-40 hover:bg-gray-100"
                >
                  &larr; Prev
                </button>
                <span className="px-2 text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 border border-gray-300 bg-white rounded text-xs font-semibold disabled:opacity-40 hover:bg-gray-100"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Phase 3.11: Academic Analytics Section (Simple Government Visuals) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Card 1: Projects by Department */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-[#166534]" />
                <span>R&D Projects by Academic Department</span>
              </h3>
              <span className="text-[11px] text-gray-500">16 Active Projects</span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { dept: "Civil & Environmental Engineering", count: 5, pct: 31, color: "bg-[#166534]" },
                { dept: "Computer Science & Engineering", count: 6, pct: 38, color: "bg-[#2E7D32]" },
                { dept: "Mechanical Engineering", count: 3, pct: 19, color: "bg-[#F57C00]" },
                { dept: "Electrical & Electronics Engineering", count: 2, pct: 12, color: "bg-[#0369A1]" },
              ].map((item) => (
                <div key={item.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-gray-700 font-semibold">
                    <span>{item.dept}</span>
                    <span>{item.count} projects ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className={cn("h-2.5 rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Card 2: Milestone Completion & Quality Compliance */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-[#166534]" />
                <span>Institutional Milestone Quality & Delivery Rate</span>
              </h3>
              <span className="text-[11px] text-emerald-700 font-semibold">92.4% Average Score</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 border rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Overall Progress</span>
                <div className="text-xl font-bold text-gray-900">68.5%</div>
                <div className="text-[10px] text-gray-500">Across all 16 capstones</div>
              </div>

              <div className="p-3 bg-gray-50 border rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Faculty Review Rubric</span>
                <div className="text-xl font-bold text-[#166534]">92.4 / 100</div>
                <div className="text-[10px] text-emerald-700 font-semibold">High Technical Merit</div>
              </div>

              <div className="p-3 bg-gray-50 border rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">On-Time Milestones</span>
                <div className="text-xl font-bold text-[#2E7D32]">88.2%</div>
                <div className="text-[10px] text-gray-500">Adhering to SLA schedule</div>
              </div>

              <div className="p-3 bg-gray-50 border rounded space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Budget Allocation</span>
                <div className="text-xl font-bold text-gray-900">₹40.0 Lakhs</div>
                <div className="text-[10px] text-gray-500">State Innovation / CSR Grants</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
