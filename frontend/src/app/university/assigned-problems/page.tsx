"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { academicService } from "@/services/academic.service";
import { projectService } from "@/services/project.service";
import { ChallengeAssignment, Faculty } from "@/features/academic/types/academic.types";
import {
  FileText,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  X,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All Categories",
  "Water Conservation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Infrastructure",
  "Waste Management",
  "Renewable Energy",
  "Rural Connectivity",
  "Sanitation & Hygiene",
];

const STATUS_FILTERS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Intake Pending", value: "INTAKE_PENDING" },
  { label: "Claimed", value: "CLAIMED" },
  { label: "Dept Assigned", value: "DEPARTMENT_ASSIGNED" },
  { label: "Active Research", value: "ACTIVE_RESEARCH" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function AssignedProblemsPage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<ChallengeAssignment[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [assigningChallenge, setAssigningChallenge] = useState<ChallengeAssignment | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Create Project Modal
  const [projectChallenge, setProjectChallenge] = useState<ChallengeAssignment | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamLeadName, setTeamLeadName] = useState("");
  const [targetDate, setTargetDate] = useState("2026-12-15");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [assignData, facData] = await Promise.all([
        academicService.listAssignedChallenges(),
        academicService.listFaculty(),
      ]);
      setAssignments(assignData);
      setFacultyList(facData);
    } catch (err: any) {
      setError(err.message || "Failed to load assigned challenges registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.challengeTitle.toLowerCase().includes(q) ||
        item.challengeId.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.departmentName && item.departmentName.toLowerCase().includes(q)) ||
        (item.leadFacultyName && item.leadFacultyName.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "All Categories" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesDept =
        departmentFilter === "ALL" || item.departmentName === departmentFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesDept;
    });
  }, [assignments, searchQuery, categoryFilter, statusFilter, departmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, currentPage, pageSize]);

  // Handle Assign Faculty
  const handleAssignFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningChallenge || !selectedFacultyId) return;

    try {
      setIsAssigning(true);
      const chosenFaculty = facultyList.find((f) => f.id === selectedFacultyId);
      if (!chosenFaculty) throw new Error("Please select a valid faculty member.");

      await academicService.assignMentor(
        chosenFaculty.id,
        "team-squad",
        assigningChallenge.challengeId
      );

      // Update local state
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assigningChallenge.id
            ? {
                ...a,
                leadFacultyId: chosenFaculty.id,
                leadFacultyName: chosenFaculty.name,
                departmentName: chosenFaculty.departmentName,
                status: "DEPARTMENT_ASSIGNED",
              }
            : a
        )
      );

      showToast(`Successfully assigned ${chosenFaculty.name} as lead faculty guide.`);
      setAssigningChallenge(null);
      setSelectedFacultyId("");
    } catch (err: any) {
      alert(err.message || "Failed to assign faculty member.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Create Project Quick Launch
  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectChallenge) return;

    try {
      setIsCreatingProject(true);
      const newProj = await projectService.createProject({
        title: projectTitle || `R&D Solution: ${projectChallenge.challengeTitle}`,
        synopsis: `Engineering intervention addressing ${projectChallenge.category} bottleneck in community field sites.`,
        description: `Academic research squad deployed under ${projectChallenge.universityName} to formulate, prototype, and test validated solutions.`,
        category: projectChallenge.category,
        challengeId: projectChallenge.challengeId,
        challengeTitle: projectChallenge.challengeTitle,
        teamId: `team-${Date.now().toString().slice(-4)}`,
        teamName: teamName || "Student Innovation Squad 1",
        teamLeadName: teamLeadName || "Student Project Lead",
        teamMembersCount: 4,
        facultyMentorId: projectChallenge.leadFacultyId || "fac-1",
        facultyMentorName: projectChallenge.leadFacultyName || "Dr. Rajesh Sharma",
        facultyMentorInstitution: projectChallenge.universityName || "Birla Institute of Technology, Mesra",
        targetCompletionDate: targetDate,
        tags: ["capstone-project", "state-challenge", "field-deployment"],
      });

      // Update assignment status to ACTIVE_RESEARCH
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === projectChallenge.id ? { ...a, status: "ACTIVE_RESEARCH" } : a
        )
      );

      showToast(`Capstone R&D Project "${newProj.title}" successfully registered!`);
      setProjectChallenge(null);
      router.push(`/university/projects/${newProj.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create research project.");
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-[#166534] text-white px-4 py-2.5 rounded-md shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/" className="hover:text-[#166534]">Portal</Link>
              <span>/</span>
              <Link href="/university/dashboard" className="hover:text-[#166534]">University Command</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">Assigned Challenges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
              Assigned Societal Problems & Challenge Register
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Official catalog of community challenges allocated by district authorities for institutional R&D and faculty mentorship.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md shadow-2xs inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-gray-500", isLoading && "animate-spin")} />
              <span>Refresh Catalog</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar (GeM Style) */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Filter className="h-3.5 w-3.5 text-[#166534]" />
              <span>Institutional Search & Department Filters</span>
            </div>
            {(searchQuery || categoryFilter !== "All Categories" || statusFilter !== "ALL" || departmentFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All Categories");
                  setStatusFilter("ALL");
                  setDepartmentFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-[11px] text-[#166534] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Title, ID, Faculty..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            {/* Category Dropdown */}
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

            {/* Status Dropdown */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s.value} value={s.value}>
                    Status: {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Dropdown */}
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
          </div>
        </div>

        {/* Phase 3.3: Structured Government Data Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center space-y-3">
              <div className="h-6 w-6 border-2 border-[#166534] border-t-transparent rounded-full animate-spin" />
              <span>Loading Assigned Challenges Registry...</span>
            </div>
          ) : error ? (
            <div className="py-12 px-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
              <div className="text-sm font-bold text-gray-900">{error}</div>
              <button onClick={loadData} className="text-xs text-[#166534] font-semibold underline">
                Retry Request
              </button>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-2">
              <FileText className="h-10 w-10 text-gray-400 mx-auto stroke-1" />
              <div className="text-sm font-semibold text-gray-800">No assigned challenges found</div>
              <p className="text-xs text-gray-500">
                Try adjusting your search criteria or resetting filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Challenge ID</th>
                      <th className="py-3 px-4">Title & Scope</th>
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Faculty Assigned</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        {/* Challenge ID */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-gray-600">
                          {item.challengeId.slice(0, 8).toUpperCase()}
                        </td>

                        {/* Title */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/citizen/report/${item.challengeId}`}
                            className="font-bold text-[#212121] hover:text-[#166534] hover:underline line-clamp-1 text-xs sm:text-sm"
                          >
                            {item.challengeTitle}
                          </Link>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {item.departmentName || "General Academic Allocation"}
                          </div>
                        </td>

                        {/* District */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-gray-700 font-medium">
                            <MapPin className="h-3 w-3 text-red-600 shrink-0" />
                            <span>Ranchi, JH</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-300 text-gray-800 text-[11px] font-medium">
                            {item.category}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-[#F57C00] border border-orange-200">
                            {item.urgency || "HIGH"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[11px] font-semibold border",
                              item.status === "CLAIMED"
                                ? "bg-blue-50 text-[#166534] border-blue-200"
                                : item.status === "DEPARTMENT_ASSIGNED"
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : item.status === "ACTIVE_RESEARCH"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-gray-100 text-gray-700 border-gray-300"
                            )}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Faculty Assigned */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.leadFacultyName ? (
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <GraduationCap className="h-3.5 w-3.5 text-[#166534]" />
                              <span>{item.leadFacultyName}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAssigningChallenge(item)}
                              className="text-xs font-semibold text-[#166534] hover:underline flex items-center gap-1"
                            >
                              <UserCheck className="h-3 w-3" />
                              <span>+ Assign Faculty</span>
                            </button>
                          )}
                        </td>

                        {/* Actions (View, Assign Faculty, Create Project) */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/citizen/report/${item.challengeId}`}
                              className="px-2 py-1 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold transition-colors"
                              title="View Official Problem Dossier"
                            >
                              View
                            </Link>

                            <button
                              type="button"
                              onClick={() => setAssigningChallenge(item)}
                              className="px-2 py-1 rounded bg-blue-50 border border-blue-200 text-[#166534] hover:bg-blue-100 text-[11px] font-semibold transition-colors"
                              title="Assign or Change Faculty Guide"
                            >
                              Assign Guide
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setProjectChallenge(item);
                                setProjectTitle(`R&D Solution: ${item.challengeTitle}`);
                                setTeamName("AquaTech Engineering Squad");
                                setTeamLeadName("Rahul Verma (Final Yr B.Tech)");
                              }}
                              className="px-2 py-1 rounded bg-[#166534] text-white hover:bg-[#083b7a] text-[11px] font-bold transition-colors shadow-2xs"
                              title="Launch Capstone R&D Project"
                            >
                              Launch Project
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer & Pagination */}
              <div className="bg-gray-50 px-4 py-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
                <div>
                  Showing{" "}
                  <strong className="text-gray-900">
                    {Math.min(filteredAssignments.length, (currentPage - 1) * pageSize + 1)}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-gray-900">
                    {Math.min(filteredAssignments.length, currentPage * pageSize)}
                  </strong>{" "}
                  of <strong className="text-gray-900">{filteredAssignments.length}</strong> assigned records
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

        {/* MODAL 1: Assign Faculty Modal */}
        {assigningChallenge && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-md max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#166534]" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Assign Faculty Research Mentor
                  </h3>
                </div>
                <button
                  onClick={() => setAssigningChallenge(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs space-y-2">
                <div className="p-3 bg-gray-50 border rounded text-gray-700">
                  <span className="font-bold text-gray-900 block">{assigningChallenge.challengeTitle}</span>
                  <span className="text-[11px] text-gray-500">
                    Sector: {assigningChallenge.category} • Ref: #{assigningChallenge.challengeId.slice(0, 8)}
                  </span>
                </div>

                <form onSubmit={handleAssignFacultySubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Select Available Faculty Guide <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedFacultyId}
                      onChange={(e) => setSelectedFacultyId(e.target.value)}
                      required
                      className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded text-xs text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#166534]"
                    >
                      <option value="">-- Choose Faculty Member --</option>
                      {facultyList.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.departmentName}) — Workload: {f.activeMentorshipCount}/3 [{f.availability}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900">
                    <strong>AICTE Guideline:</strong> Faculty mentors guide student capstone squads, review milestones, and authenticate field deployment reports.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setAssigningChallenge(null)}
                      className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAssigning || !selectedFacultyId}
                      className="px-4 py-1.5 bg-[#166534] hover:bg-[#083b7a] text-white text-xs font-bold rounded shadow-xs disabled:opacity-50"
                    >
                      {isAssigning ? "Assigning..." : "Confirm Appointment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Launch Capstone Project Modal */}
        {projectChallenge && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-md max-w-xl w-full p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#166534]" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Launch Capstone Research Project
                  </h3>
                </div>
                <button
                  onClick={() => setProjectChallenge(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProjectSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Project Working Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    required
                    className="w-full p-2.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded text-xs text-gray-800 focus:bg-white focus:ring-1 focus:ring-[#166534]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Student Squad Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                      placeholder="e.g., AquaTech Squad"
                      className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded text-xs text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Student Lead Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={teamLeadName}
                      onChange={(e) => setTeamLeadName(e.target.value)}
                      required
                      placeholder="e.g., Rahul Verma"
                      className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded text-xs text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Target Completion Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    required
                    className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded text-xs text-gray-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setProjectChallenge(null)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingProject}
                    className="px-4 py-1.5 bg-[#166534] hover:bg-[#083b7a] text-white text-xs font-bold rounded shadow-xs"
                  >
                    {isCreatingProject ? "Creating..." : "Initialize Workspace & Squad"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
