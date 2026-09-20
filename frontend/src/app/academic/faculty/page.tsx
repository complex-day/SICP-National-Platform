"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { academicService } from "@/services/academic.service";
import { Faculty } from "@/features/academic/types/academic.types";
import {
  FacultyAvailabilityBadge,
  FacultyProfileModal,
  AssignMentorModal,
} from "@/features/academic/components";
import {
  Search,
  Filter,
  Sparkles,
  Building2,
} from "lucide-react";

const DEPARTMENTS = [
  "ALL",
  "Computer Science & Engineering",
  "Mechanical & Automation Engineering",
  "Civil & Infrastructure Engineering",
  "Agriculture & Bioresource Engineering",
  "Biotechnology & Bioengineering",
  "Electrical & Electronics Engineering",
  "Chemical & Materials Science",
  "Environmental & Water Resource Engineering",
];

const AVAILABILITY_OPTIONS: { label: string; value: string }[] = [
  { label: "All Availability", value: "ALL" },
  { label: "Available (0-1 / 3)", value: "AVAILABLE" },
  { label: "Near Capacity (2 / 3)", value: "NEAR_CAPACITY" },
  { label: "Full Capacity (3 / 3)", value: "FULL" },
];

export default function AcademicFacultyPage() {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedAvailability, setSelectedAvailability] = useState("ALL");

  // Modals
  const [selectedFacultyForProfile, setSelectedFacultyForProfile] = useState<Faculty | null>(null);
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState<Faculty | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const loadFaculty = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await academicService.listFaculty({
        search: searchQuery,
        department: selectedDepartment === "ALL" ? undefined : selectedDepartment,
        availability: selectedAvailability === "ALL" ? undefined : selectedAvailability,
      });
      setFacultyList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load faculty directory.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, [selectedDepartment, selectedAvailability]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFaculty();
  };

  const handleActionSuccess = (message: string) => {
    setSuccessToast(message);
    loadFaculty();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const columns: ColumnDef<Faculty>[] = [
    {
      key: "name",
      header: "Faculty Name & Designation",
      sortable: true,
      render: (row: Faculty) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              {row.name}
              {row.activeMentorshipCount >= 3 && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded">
                  MAX CAP
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {row.designation} · <span className="text-primary font-medium">{row.departmentName}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "universityName",
      header: "Institution",
      sortable: true,
      render: (row: Faculty) => (
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
          {row.universityName}
        </span>
      ),
    },
    {
      key: "specializations",
      header: "Specialization",
      render: (row: Faculty) => (
        <div className="flex flex-wrap gap-1 max-w-[240px]">
          {row.specializations.slice(0, 2).map((s: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium"
            >
              {s}
            </span>
          ))}
          {row.specializations.length > 2 && (
            <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">
              +{row.specializations.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "activeMentorshipCount",
      header: "Mentorship Workload (Max 3)",
      sortable: true,
      render: (row: Faculty) => {
        const count = row.activeMentorshipCount;
        const isMax = count >= 3;
        return (
          <div className="space-y-1 min-w-[130px]">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-mono font-bold ${isMax ? "text-rose-400" : "text-foreground"}`}>
                {count} / 3 Teams
              </span>
              <span className="text-[10px] text-muted-foreground">
                {isMax ? "Locked" : `${3 - count} open`}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  count === 1
                    ? "w-1/3 bg-emerald-500"
                    : count === 2
                    ? "w-2/3 bg-amber-500"
                    : "w-full bg-rose-500"
                }`}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "availability",
      header: "Availability",
      sortable: true,
      render: (row: Faculty) => (
        <FacultyAvailabilityBadge
          availability={row.availability}
          activeCount={row.activeMentorshipCount}
          showCount
        />
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row: Faculty) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedFacultyForProfile(row)}
            className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            View Profile
          </button>
          <button
            disabled={row.activeMentorshipCount >= 3}
            onClick={() => {
              setSelectedFacultyForAssign(row);
              setIsAssignModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold shadow-glow-sm transition-all"
          >
            Assign Mentor
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
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
          title="Faculty Mentorship Directory"
          description="Institutional faculty roster, research specialization indices, and statutory 3-team capacity constraint management."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academic Hub", href: "/dashboard/academic" },
            { label: "Faculty Directory", href: "/academic/faculty" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              100+ Faculty Profiles
            </span>
          }
          actions={
            <Link
              href="/academic/matching"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Mentor Matching
            </Link>
          }
        />

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty by name, department, university, or specialization..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow transition-all"
            >
              Search Faculty
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Department:</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px] truncate"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium">Capacity:</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(selectedDepartment !== "ALL" ||
              selectedAvailability !== "ALL" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDepartment("ALL");
                  setSelectedAvailability("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-primary font-semibold hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Table / States */}
        {isLoading ? (
          <LoadingState message="Loading institutional faculty directory..." />
        ) : error ? (
          <ErrorState
            title="Faculty Directory Failed"
            message={error}
            onRetry={loadFaculty}
          />
        ) : facultyList.length === 0 ? (
          <EmptyState
            title="No Faculty Members Found"
            description="No faculty profiles matched your search or department filter. Try broadening your criteria."
            action={{
              label: "Reset Search",
              onClick: () => {
                setSearchQuery("");
                setSelectedDepartment("ALL");
                setSelectedAvailability("ALL");
              },
            }}
          />
        ) : (
          <DataTable
            data={facultyList}
            columns={columns}
            pageSize={10}
            onRowClick={(row) => setSelectedFacultyForProfile(row)}
          />
        )}
      </div>

      {/* Modals */}
      <FacultyProfileModal
        isOpen={Boolean(selectedFacultyForProfile)}
        onClose={() => setSelectedFacultyForProfile(null)}
        faculty={selectedFacultyForProfile}
        onAssignMentor={(fac) => {
          setSelectedFacultyForAssign(fac);
          setIsAssignModalOpen(true);
        }}
      />

      <AssignMentorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleActionSuccess}
        preselectedFaculty={selectedFacultyForAssign}
        facultyList={facultyList}
      />
    </DashboardLayout>
  );
}
