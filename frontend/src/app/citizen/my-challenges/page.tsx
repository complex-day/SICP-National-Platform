"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Challenge, ChallengeCategory, ChallengeStatus } from "@/features/challenges/types/challenge.types";
import { ChallengeStatusBadge } from "@/features/challenge/components/ChallengeStatusBadge";
import { ChallengeUrgencyBadge } from "@/features/challenge/components/ChallengeUrgencyBadge";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";
import {
  Plus,
  ArrowUpRight,
  Inbox,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All Categories",
  "Water Conservation",
  "Healthcare Access",
  "Agricultural Productivity",
  "Education Quality",
  "Renewable Energy",
  "Waste Management",
  "Rural Connectivity",
  "Sanitation & Hygiene",
];

const STATUS_FILTERS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Assigned / Claimed", value: "CLAIMED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function MyReportsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadMyChallenges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await challengeService.listMyChallenges(1, 100, user?.id);
      setChallenges(res.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load your submitted challenges.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyChallenges();
  }, [user?.id]);

  // Extract unique districts
  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    challenges.forEach((c) => {
      if (c.location?.district) set.add(c.location.district);
    });
    return Array.from(set);
  }, [challenges]);

  // Filtered & Paginated records
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location?.district && c.location.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.location?.state && c.location.state.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" ||
        c.status.toUpperCase() === statusFilter ||
        (statusFilter === "CLAIMED" && (c.status === "CLAIMED" || (c.status as string) === "ASSIGNED"));

      // Category filter
      const matchesCategory =
        categoryFilter === "All Categories" || c.category === categoryFilter;

      // District filter
      const matchesDistrict =
        districtFilter === "ALL" || c.location?.district === districtFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesDistrict;
    });
  }, [challenges, searchQuery, statusFilter, categoryFilter, districtFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredChallenges.length / pageSize));
  const paginatedChallenges = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredChallenges.slice(start, start + pageSize);
  }, [filteredChallenges, currentPage, pageSize]);

  // KPI counts
  const totalCount = challenges.length;
  const underReviewCount = challenges.filter(
    (c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW"
  ).length;
  const assignedCount = challenges.filter(
    (c) => c.status === "CLAIMED" || (c.status as string) === "ASSIGNED" || c.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = challenges.filter((c) => c.status === "RESOLVED").length;

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        {/* Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/" className="hover:text-[#166534]">Portal</Link>
              <span>/</span>
              <Link href="/citizen/dashboard" className="hover:text-[#166534]">Citizen Command</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium">My Grievance Reports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
              Citizen Grievance & Challenge Register
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Official record of all societal challenges and community grievances submitted under your National Citizen ID.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadMyChallenges}
              disabled={isLoading}
              className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md shadow-2xs inline-flex items-center gap-1.5 transition-colors"
              title="Refresh Register"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-gray-500", isLoading && "animate-spin")} />
              <span>Refresh</span>
            </button>

            <Link
              href="/citizen/create-challenge"
              className="px-4 py-2 bg-[#166534] hover:bg-[#083b7a] text-white text-xs sm:text-sm font-bold rounded-md transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Submit New Challenge</span>
            </Link>
          </div>
        </div>

        {/* 4-Stat Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase text-gray-500">Total Logged</div>
              <div className="text-xl font-bold text-[#212121] mt-0.5">{totalCount}</div>
            </div>
            <FileText className="h-7 w-7 text-gray-400 opacity-60" />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 flex items-center justify-between border-l-4 border-l-[#F57C00]">
            <div>
              <div className="text-[11px] font-bold uppercase text-gray-500">Under Review</div>
              <div className="text-xl font-bold text-[#F57C00] mt-0.5">{underReviewCount}</div>
            </div>
            <Clock className="h-7 w-7 text-[#F57C00] opacity-60" />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 flex items-center justify-between border-l-4 border-l-[#166534]">
            <div>
              <div className="text-[11px] font-bold uppercase text-gray-500">University Assigned</div>
              <div className="text-xl font-bold text-[#166534] mt-0.5">{assignedCount}</div>
            </div>
            <Building className="h-7 w-7 text-[#166534] opacity-60" />
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 flex items-center justify-between border-l-4 border-l-[#2E7D32]">
            <div>
              <div className="text-[11px] font-bold uppercase text-gray-500">Resolved & Closed</div>
              <div className="text-xl font-bold text-[#2E7D32] mt-0.5">{resolvedCount}</div>
            </div>
            <CheckCircle className="h-7 w-7 text-[#2E7D32] opacity-60" />
          </div>
        </div>

        {/* Filter Toolbar (GeM Style) */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Filter className="h-3.5 w-3.5 text-[#166534]" />
              <span>Audit & Search Filters</span>
            </div>
            {(searchQuery || statusFilter !== "ALL" || categoryFilter !== "All Categories" || districtFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setCategoryFilter("All Categories");
                  setDistrictFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-[11px] text-[#166534] hover:underline font-semibold"
              >
                Reset All Filters
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
                placeholder="Search Title, ID or District..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
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
                    {c === "All Categories" ? "Sector: All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* District Dropdown */}
            <div>
              <select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                <option value="ALL">District: All Districts</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Structured Data Table (GeM Style) */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-gray-500 flex flex-col items-center justify-center space-y-3">
              <div className="h-6 w-6 border-2 border-[#166534] border-t-transparent rounded-full animate-spin" />
              <span>Querying National Registry & Challenge Database...</span>
            </div>
          ) : error ? (
            <div className="py-12 px-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
              <div className="text-sm font-bold text-gray-900">{error}</div>
              <button
                onClick={loadMyChallenges}
                className="text-xs text-[#166534] font-semibold underline"
              >
                Retry Request
              </button>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-3">
              <Inbox className="h-10 w-10 text-gray-400 mx-auto stroke-1" />
              <div className="text-base font-semibold text-gray-800">
                {challenges.length === 0
                  ? "You have not submitted any challenges yet."
                  : "No challenges match the active filter criteria."}
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {challenges.length === 0
                  ? "Step up for your community by reporting a verified grassroots bottleneck in water, agriculture, rural health, or education."
                  : "Try clearing your search query or selecting 'All Statuses' to view all registered challenges."}
              </p>
              {challenges.length === 0 && (
                <div className="pt-2">
                  <Link
                    href="/citizen/create-challenge"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#166534] text-white text-xs font-bold rounded-md hover:bg-[#083b7a] transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Submit Your First Challenge</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 w-28">Ref ID</th>
                      <th className="py-3 px-4">Challenge Title & Scope</th>
                      <th className="py-3 px-4">District / State</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Urgency</th>
                      <th className="py-3 px-4">Logged On</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {paginatedChallenges.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                        onClick={() => router.push(`/citizen/report/${item.id}`)}
                      >
                        {/* Ref ID */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-gray-600">
                          {item.id.slice(0, 8).toUpperCase()}
                        </td>

                        {/* Title & Scope */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/citizen/report/${item.id}`}
                            className="font-bold text-[#212121] group-hover:text-[#166534] transition-colors line-clamp-1 text-xs sm:text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.title}
                          </Link>
                          <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            ~{item.affectedPopulation.toLocaleString()} citizens impacted •{" "}
                            {item.claimedBy ? (
                              <span className="text-[#166534] font-medium">
                                Claimed by {item.claimedBy.institution}
                              </span>
                            ) : (
                              <span>Pending University Assignment</span>
                            )}
                          </div>
                        </td>

                        {/* District / State */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-medium text-gray-800">
                            <MapPin className="h-3 w-3 text-red-600 shrink-0" />
                            <span>{item.location?.district || "District"}</span>
                          </div>
                          <span className="text-[11px] text-gray-500 block">
                            {item.location?.state || "State"}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 font-medium rounded text-[11px]">
                            {item.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <ChallengeStatusBadge status={item.status} />
                        </td>

                        {/* Urgency */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <ChallengeUrgencyBadge urgency={item.urgency} />
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/citizen/report/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-gray-300 text-xs font-semibold text-[#166534] hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-2xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>View Details</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination & Row Counter */}
              <div className="bg-gray-50 px-4 py-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-600">
                <div>
                  Showing{" "}
                  <strong className="text-gray-900">
                    {Math.min(filteredChallenges.length, (currentPage - 1) * pageSize + 1)}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-gray-900">
                    {Math.min(filteredChallenges.length, currentPage * pageSize)}
                  </strong>{" "}
                  of <strong className="text-gray-900">{filteredChallenges.length}</strong> registered records
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
      </div>
    </DashboardLayout>
  );
}
