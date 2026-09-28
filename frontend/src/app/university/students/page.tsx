"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { teamService } from "@/services/team.service";
import { Team } from "@/features/teams/types/team.types";
import {
  Users,
  GraduationCap,
  Layers,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ShieldCheck,
  Building2,
  Award,
  Sparkles,
  ChevronRight,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentRecord {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  year: string;
  skills: string[];
  assignedTeam: string | null;
  availability: "AVAILABLE" | "ASSIGNED" | "GRADUATING";
  performanceScore: number; // Out of 100
}

const MOCK_STUDENTS: StudentRecord[] = [
  {
    id: "stu-1",
    name: "Rahul Verma",
    rollNo: "BITM/2023/CS/042",
    department: "Computer Science & Engineering",
    year: "Final Year (4th Yr)",
    skills: ["AI / Machine Learning", "Python", "IoT Systems"],
    assignedTeam: "AquaTech Engineering Squad",
    availability: "ASSIGNED",
    performanceScore: 94,
  },
  {
    id: "stu-2",
    name: "Pooja Sharma",
    rollNo: "BITM/2023/CV/018",
    department: "Civil & Environmental Engineering",
    year: "Final Year (4th Yr)",
    skills: ["Hydraulic Modeling", "GIS Mapping", "Water Testing"],
    assignedTeam: "AquaTech Engineering Squad",
    availability: "ASSIGNED",
    performanceScore: 91,
  },
  {
    id: "stu-3",
    name: "Anand Kumar",
    rollNo: "BITM/2024/ME/029",
    department: "Mechanical Engineering",
    year: "3rd Year",
    skills: ["SolidWorks CAD", "Thermal Simulation", "Fabrication"],
    assignedTeam: "Solar Agro Logistics",
    availability: "ASSIGNED",
    performanceScore: 88,
  },
  {
    id: "stu-4",
    name: "Sneha Mukherjee",
    rollNo: "BITM/2024/BT/012",
    department: "Bioengineering & Biotechnology",
    year: "3rd Year",
    skills: ["Soil Microbiology", "Spectroscopy", "Assay Design"],
    assignedTeam: "BioSoil Fertility Hub",
    availability: "ASSIGNED",
    performanceScore: 96,
  },
  {
    id: "stu-5",
    name: "Vikram Singh",
    rollNo: "BITM/2024/EE/051",
    department: "Electrical & Electronics Engineering",
    year: "3rd Year",
    skills: ["Embedded C", "Solar Inverter Design", "Telemetry"],
    assignedTeam: null,
    availability: "AVAILABLE",
    performanceScore: 89,
  },
  {
    id: "stu-6",
    name: "Divya Patel",
    rollNo: "BITM/2025/CS/088",
    department: "Computer Science & Engineering",
    year: "2nd Year",
    skills: ["Next.js React", "TypeScript", "PostgreSQL"],
    assignedTeam: null,
    availability: "AVAILABLE",
    performanceScore: 92,
  },
  {
    id: "stu-7",
    name: "Amit Soren",
    rollNo: "BITM/2024/CV/034",
    department: "Civil & Environmental Engineering",
    year: "3rd Year",
    skills: ["Rural Infrastructure", "Cost Estimation", "AutoCAD"],
    assignedTeam: null,
    availability: "AVAILABLE",
    performanceScore: 86,
  },
  {
    id: "stu-8",
    name: "Neha Kumari",
    rollNo: "BITM/2023/EE/019",
    department: "Electrical & Electronics Engineering",
    year: "Final Year (4th Yr)",
    skills: ["Microgrid Control", "Battery Management", "IoT"],
    assignedTeam: "CleanGrid Micro-Station",
    availability: "ASSIGNED",
    performanceScore: 95,
  },
];

const SKILL_CATEGORIES = [
  { name: "IoT & Telemetry", count: 48, pct: "24%" },
  { name: "AI / Machine Learning", count: 62, pct: "31%" },
  { name: "Water & Soil Chemistry", count: 32, pct: "16%" },
  { name: "Full-Stack Web/Mobile", count: 54, pct: "27%" },
  { name: "CAD & Structural Fabrication", count: 44, pct: "22%" },
];

export default function StudentParticipationDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>(MOCK_STUDENTS);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [skillFilter, setSkillFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await teamService.listTeams();
        setTeams(res.items || []);
      } catch (err) {
        console.error("Failed to load student teams:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.skills.some((sk) => sk.toLowerCase().includes(q));

      const matchesDept = deptFilter === "ALL" || s.department === deptFilter;
      const matchesAvail = availabilityFilter === "ALL" || s.availability === availabilityFilter;
      const matchesSkill = skillFilter === "ALL" || s.skills.some((sk) => sk.includes(skillFilter));

      return matchesSearch && matchesDept && matchesAvail && matchesSkill;
    });
  }, [students, searchQuery, deptFilter, availabilityFilter, skillFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

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
              <span className="text-gray-800 font-medium">Student Participation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
              Student Innovation Roster & Multidisciplinary Squads
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Manage student innovator capacity, multidisciplinary skill distribution, and capstone research squad allocations.
            </p>
          </div>
        </div>

        {/* Phase 3.10: Student Participation KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Registered Students"
            value={240}
            subtitle="Across 5 Engineering Depts"
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            label="Available for Squads"
            value={68}
            subtitle="Ready for Problem Allocation"
            trend="Unallocated Talent"
            trendType="positive"
            icon={<UserCheck className="h-5 w-5" />}
          />
          <KpiCard
            label="Active Teams"
            value={42}
            subtitle="Working on Live Challenges"
            trend="Active Squads"
            trendType="positive"
            icon={<Layers className="h-5 w-5" />}
          />
          <KpiCard
            label="Completed Projects"
            value={18}
            subtitle="Verified Capstone Outcomes"
            trend="100% Validated"
            trendType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Multidisciplinary Skill Distribution & Department Capacity */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#166534]" />
              <span>Multidisciplinary Skill Distribution & Academic Capacity</span>
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">240 Active Student Innovators</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {SKILL_CATEGORIES.map((cat) => (
              <div key={cat.name} className="p-3 bg-gray-50 border rounded space-y-1">
                <span className="text-[11px] font-semibold text-gray-800 block truncate">{cat.name}</span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#166534]">{cat.count}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{cat.pct} capacity</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Filter className="h-3.5 w-3.5 text-[#166534]" />
              <span>Student Capacity & Skill Filters</span>
            </div>
            {(searchQuery || deptFilter !== "ALL" || availabilityFilter !== "ALL" || skillFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDeptFilter("ALL");
                  setAvailabilityFilter("ALL");
                  setSkillFilter("ALL");
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
                placeholder="Search Student, Roll No, Skills..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            {/* Department */}
            <div>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-md text-[#212121] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                <option value="ALL">Department: All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & AI</option>
                <option value="Civil & Environmental Engineering">Civil & Environmental</option>
                <option value="Mechanical Engineering">Mechanical & Robotics</option>
                <option value="Electrical & Electronics Engineering">Electrical & Electronics</option>
                <option value="Bioengineering & Biotechnology">Biotechnology</option>
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
                <option value="AVAILABLE">Available for Squad Assignment</option>
                <option value="ASSIGNED">Assigned to Active Squad</option>
              </select>
            </div>
          </div>
        </div>

        {/* Phase 3.5: Student Roster Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Student Innovator</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4">Skills & Specializations</th>
                  <th className="py-3 px-4">Assigned Squad / Project</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4">Performance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Student */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      <div>
                        <span>{s.name}</span>
                        <span className="block text-[11px] text-gray-500 font-mono font-normal">
                          {s.rollNo}
                        </span>
                      </div>
                    </td>

                    {/* Dept */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{s.department}</span>
                      <span className="block text-[11px] text-gray-500">{s.year}</span>
                    </td>

                    {/* Skills */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.skills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Assigned Squad */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {s.assignedTeam ? (
                        <span className="font-semibold text-[#166534]">{s.assignedTeam}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned (Pool)</span>
                      )}
                    </td>

                    {/* Availability */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {s.availability === "AVAILABLE" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#2E7D32] border border-emerald-300">
                          ● Available
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#166534] border border-blue-200">
                          ● Active Squad
                        </span>
                      )}
                    </td>

                    {/* Performance */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-gray-800 text-xs">{s.performanceScore}%</span>
                      <span className="text-[10px] text-gray-500 ml-1">Index</span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => alert(`Student Dossier for ${s.name} (${s.rollNo})\nDepartment: ${s.department}\nPerformance Index: ${s.performanceScore}/100`)}
                        className="px-2.5 py-1 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Profile
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
                {Math.min(filteredStudents.length, (currentPage - 1) * pageSize + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-gray-900">
                {Math.min(filteredStudents.length, currentPage * pageSize)}
              </strong>{" "}
              of <strong className="text-gray-900">{filteredStudents.length}</strong> student innovators
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

        {/* Active Multidisciplinary Squads Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#166534]" />
              <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                Active Multidisciplinary Capstone Squads ({teams.length})
              </h2>
            </div>
            <Link
              href="/teams"
              className="text-xs font-semibold text-[#166534] hover:underline inline-flex items-center gap-1"
            >
              <span>View Squad Network</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Squad Name</th>
                  <th className="py-2.5 px-4">Problem Statement / Sector</th>
                  <th className="py-2.5 px-4">Squad Leader</th>
                  <th className="py-2.5 px-4">Members</th>
                  <th className="py-2.5 px-4">Project Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {teams.slice(0, 4).map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{t.name}</td>
                    <td className="py-3 px-4 text-gray-700 max-w-xs truncate">
                      {t.challengeTitle || t.challengeCategory}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{t.leaderName}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">{t.members.length}</span>
                      <span className="text-gray-500"> / {t.maxMembers}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#2E7D32] h-1.5 rounded-full"
                            style={{ width: `${t.projectProgress || 35}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-700 text-[11px]">
                          {t.projectProgress || 35}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
