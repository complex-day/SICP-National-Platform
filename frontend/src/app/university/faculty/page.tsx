"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { academicService } from "@/services/academic.service";
import { Faculty } from "@/features/academic/types/academic.types";
import {
  GraduationCap,
  Building2,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Award,
  AlertCircle,
  X,
  Mail,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FacultyLoadBadge({ count }: { count: number }) {
  if (count <= 2) {
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#2E7D32] border border-emerald-300">
        Low Load ({count})
      </span>
    );
  }
  if (count <= 5) {
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-[#ED6C02] border border-amber-300">
        Medium Load ({count})
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-300">
      High Load ({count})
    </span>
  );
}

export function FacultyAvailabilityBadge({ availability }: { availability: string }) {
  const norm = availability.toUpperCase();
  if (norm === "AVAILABLE") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-[#2E7D32] border border-emerald-300">
        ● Available
      </span>
    );
  }
  if (norm === "NEAR_CAPACITY" || norm === "BUSY") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-[#ED6C02] border border-amber-300">
        ● Near Capacity
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700 border border-gray-300">
      ● Full / Locked
    </span>
  );
}

export default function FacultyWorkloadDashboard() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected faculty modal
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const loadFacultyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await academicService.listFaculty();
      setFaculty(data);
    } catch (err: any) {
      setError(err.message || "Failed to load faculty mentor register.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, []);

  // Filtered
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.departmentName.toLowerCase().includes(q) ||
        f.specializations.some((s) => s.toLowerCase().includes(q));

      const matchesDept =
        departmentFilter === "ALL" || f.departmentName === departmentFilter;

      const matchesAvail =
        availabilityFilter === "ALL" || f.availability.toUpperCase() === availabilityFilter;

      return matchesSearch && matchesDept && matchesAvail;
    });
  }, [faculty, searchQuery, departmentFilter, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFaculty.length / pageSize));
  const paginatedFaculty = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFaculty.slice(start, start + pageSize);
  }, [filteredFaculty, currentPage, pageSize]);

  // KPIs
  const totalAssignedChallenges = 24;
  const activeTeamsCount = 42;
  const reviewsPendingCount = 8;
  const milestonesDueCount = 14;

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/" className="hover:text-[#166534]">Portal</Link>
              <span>/</span>
              <Link href="/university/dashboard" className="hover:text-[#166534]">University Command</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">Faculty Workload</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
              Academic Faculty & Research Mentor Register
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Monitor faculty mentorship allocation, project workload distribution, and milestone review status across academic departments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadFacultyData}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md shadow-2xs inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-gray-500", isLoading && "animate-spin")} />
              <span>Refresh Roster</span>
            </button>
          </div>
        </div>

        {/* Phase 3.9: Standard Faculty Dashboard KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Assigned Challenges"
            value={totalAssignedChallenges}
            subtitle="To Institutional Guides"
            icon={<FileText className="h-5 w-5" />}
          />
          <KpiCard
            label="Active Teams"
            value={activeTeamsCount}
            subtitle="Under Faculty Guidance"
            trend="Mentorship Active"
            trendType="positive"
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            label="Reviews Pending"
            value={reviewsPendingCount}
            subtitle="Deliverables & Milestones"
            trend="Needs Evaluation"
            trendType="neutral"
            icon={<Clock className="h-5 w-5" />}
          />
          <KpiCard
            label="Milestones Due"
            value={milestonesDueCount}
            subtitle="In Next 14 Days"
            trend="Upcoming Trials"
            trendType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Filter className="h-3.5 w-3.5 text-[#166534]" />
              <span>Faculty Workload & Department Filters</span>
            </div>
            {(searchQuery || departmentFilter !== "ALL" || availabilityFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDepartmentFilter("ALL");
                  setAvailabilityFilter("ALL");
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
                placeholder="Search by Name, Department, or Specialization..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            {/* Department */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                <option value="ALL">Department: All Departments</option>
                <option value="Department of Civil & Environmental Engineering">Civil & Environmental</option>
                <option value="Department of Computer Science & Engineering">Computer Science & AI</option>
                <option value="Department of Mechanical Engineering">Mechanical & Robotics</option>
                <option value="Department of Electrical & Electronics Engineering">Electrical & Electronics</option>
                <option value="Department of Bioengineering & Biotechnology">Biotechnology</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => {
                  setAvailabilityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                <option value="ALL">Availability: All Tiers</option>
                <option value="AVAILABLE">Available for Mentorship</option>
                <option value="NEAR_CAPACITY">Near Capacity (2 Active)</option>
                <option value="FULL">Full Capacity (3 Active)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Phase 3.4: Faculty Workload Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center space-y-3">
              <div className="h-6 w-6 border-2 border-[#166534] border-t-transparent rounded-full animate-spin" />
              <span>Querying Faculty Workload Database...</span>
            </div>
          ) : error ? (
            <div className="py-12 px-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
              <div className="text-sm font-bold text-gray-900">{error}</div>
              <button onClick={loadFacultyData} className="text-xs text-[#166534] font-semibold underline">
                Retry Request
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Faculty Name</th>
                      <th className="py-3 px-4">Department & Designation</th>
                      <th className="py-3 px-4">Research Specialization</th>
                      <th className="py-3 px-4">Assigned Projects</th>
                      <th className="py-3 px-4">Current Load</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paginatedFaculty.map((f) => (
                      <tr key={f.id} className="hover:bg-blue-50/40 transition-colors">
                        {/* Faculty Name */}
                        <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded bg-[#166534]/10 text-[#166534] flex items-center justify-center font-bold text-xs border border-[#166534]/20">
                              {f.name.split(" ").pop()?.[0] || "F"}
                            </div>
                            <div>
                              <span>{f.name}</span>
                              <span className="block text-[11px] text-gray-500 font-normal">{f.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-gray-800">{f.departmentName}</span>
                          <span className="block text-[11px] text-gray-500">{f.designation}</span>
                        </td>

                        {/* Specialization */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {f.specializations.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Assigned Projects */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-gray-800 text-sm">{f.activeMentorshipCount}</span>
                          <span className="text-gray-500 text-xs"> / 3 max</span>
                        </td>

                        {/* Current Load (0-2 Low, 3-5 Med, 6+ High) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <FacultyLoadBadge count={f.activeMentorshipCount} />
                        </td>

                        {/* Availability */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <FacultyAvailabilityBadge availability={f.availability} />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedFaculty(f)}
                            className="px-2.5 py-1 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors"
                          >
                            View Portfolio
                          </button>
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
                    {Math.min(filteredFaculty.length, (currentPage - 1) * pageSize + 1)}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-gray-900">
                    {Math.min(filteredFaculty.length, currentPage * pageSize)}
                  </strong>{" "}
                  of <strong className="text-gray-900">{filteredFaculty.length}</strong> faculty mentors
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
            </>
          )}
        </div>

        {/* Faculty Portfolio Modal */}
        {selectedFaculty && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-md max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#166534]" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Faculty Mentorship Portfolio
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 border rounded space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">{selectedFaculty.name}</h4>
                  <div className="text-gray-600">{selectedFaculty.designation} • {selectedFaculty.departmentName}</div>
                  <div className="text-gray-500 font-mono text-[11px]">{selectedFaculty.email}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Research & Domain Specializations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedFaculty.specializations.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#166534] font-semibold text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div className="p-2.5 bg-gray-50 border rounded">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Current Workload</span>
                    <div className="font-bold text-gray-900 mt-0.5">{selectedFaculty.activeMentorshipCount} / 3 Mentorships</div>
                  </div>
                  <div className="p-2.5 bg-gray-50 border rounded">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Mentorship Availability</span>
                    <div className="mt-0.5">
                      <FacultyAvailabilityBadge availability={selectedFaculty.availability} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(null)}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
