"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, KPICard } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { academicService } from "@/services/academic.service";
import { Department } from "@/features/academic/types/academic.types";
import {
  Building2,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Search,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function AcademicDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await academicService.listDepartments();
      setDepartments(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load academic departments.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepartments = departments.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.universityName.toLowerCase().includes(q) ||
      d.headName.toLowerCase().includes(q) ||
      d.specializations.some((s) => s.toLowerCase().includes(q))
    );
  });

  const totalAssignedChallenges = departments.reduce((acc, d) => acc + d.assignedChallengesCount, 0);
  const totalActiveProjects = departments.reduce((acc, d) => acc + d.activeProjectsCount, 0);
  const totalFacultyCapacity = departments.reduce((acc, d) => acc + d.facultyCapacity, 0);
  const totalActiveFaculty = departments.reduce((acc, d) => acc + d.activeFacultyCount, 0);

  const columns: ColumnDef<Department>[] = [
    {
      key: "name",
      header: "Department Name & Code",
      sortable: true,
      render: (row: Department) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
            {row.code}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm flex items-center gap-2">
              {row.name}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span>{row.universityName}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "headName",
      header: "Department Chair",
      render: (row: Department) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{row.headName}</div>
          <div className="text-muted-foreground text-[11px] font-mono">{row.headEmail}</div>
        </div>
      ),
    },
    {
      key: "assignedChallengesCount",
      header: "Assigned Challenges",
      sortable: true,
      render: (row: Department) => (
        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs font-bold">
          {row.assignedChallengesCount} Challenges
        </span>
      ),
    },
    {
      key: "activeProjectsCount",
      header: "Active Projects",
      sortable: true,
      render: (row: Department) => (
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-xs font-bold">
          {row.activeProjectsCount} Projects
        </span>
      ),
    },
    {
      key: "facultyCapacity",
      header: "Faculty Capacity & Load",
      sortable: true,
      render: (row: Department) => {
        const capacity = row.facultyCapacity;
        const active = row.activeFacultyCount;
        const pct = Math.round((active / capacity) * 100);
        return (
          <div className="space-y-1 min-w-[130px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-foreground">
                {active} / {capacity} Faculty
              </span>
              <span className="text-[10px] text-muted-foreground">{pct}% Active</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "id",
      header: "Actions",
      render: (row: Department) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/academic/challenges?department=${encodeURIComponent(row.name)}`}
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1"
          >
            <span>Challenges</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading academic departments and institutional capacity..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Departments Unavailable"
          message={error}
          onRetry={loadDepartments}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Page Header */}
        <PageHeader
          title="Academic Departments & R&D Capacity"
          description="Institutional department infrastructure, active challenge load, and faculty mentorship capacity."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academic Hub", href: "/dashboard/academic" },
            { label: "Departments", href: "/academic/departments" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              HEI Departments
            </span>
          }
          actions={
            <Link
              href="/academic/challenges"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-2 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              View Challenge Intake
            </Link>
          }
        />

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Departments"
            value={departments.length}
            subtitle="Across Tier-1/Tier-2 Indian HEIs"
            icon={Building2}
            accentColor="brand"
          />
          <KPICard
            title="Assigned Challenges"
            value={totalAssignedChallenges}
            subtitle="Active problem statements mapped"
            icon={BookOpen}
            accentColor="blue"
          />
          <KPICard
            title="Active R&D Projects"
            value={totalActiveProjects}
            subtitle="Multidisciplinary student capstones"
            icon={FlaskConical}
            accentColor="purple"
          />
          <KPICard
            title="Faculty Capacity"
            value={`${totalActiveFaculty} / ${totalFacultyCapacity}`}
            subtitle="Faculty actively mentoring teams"
            icon={GraduationCap}
            accentColor="emerald"
          />
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments by name, code, university, chair, or specialization..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Department Grid / Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              Institutional Department Roster
            </h3>
            <span className="text-xs text-muted-foreground">
              Showing {filteredDepartments.length} of {departments.length} departments
            </span>
          </div>

          <DataTable
            data={filteredDepartments}
            columns={columns}
            pageSize={8}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
