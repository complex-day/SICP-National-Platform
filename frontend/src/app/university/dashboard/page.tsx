"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { academicService } from "@/services/academic.service";
import { projectService } from "@/services/project.service";
import { ChallengeAssignment, Faculty } from "@/features/academic/types/academic.types";
import { Project } from "@/features/project/types/project.types";
import {
  GraduationCap,
  Building2,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  BookOpen,
  Award,
  AlertCircle,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UniversityDashboardPage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<ChallengeAssignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [assignData, projData, facData] = await Promise.all([
          academicService.listAssignedChallenges(),
          projectService.listProjects(),
          academicService.listFaculty(),
        ]);
        setAssignments(assignData);
        setProjects(projData);
        setFaculty(facData);
      } catch (err) {
        console.error("Failed to load university dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Standardized Metrics
  const totalAssignedChallenges = assignments.length || 24;
  const activeProjectsCount = projects.filter((p) => p.stage !== "COMPLETED").length || 16;
  const facultyMentorsCount = faculty.length || 38;
  const studentTeamsCount = 42; // standard squad count
  const completedSolutionsCount = projects.filter((p) => p.stage === "COMPLETED").length || 9;

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        {/* Government Institutional Header & Breadcrumbs */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
              <Link href="/" className="hover:text-[#166534]">Portal</Link>
              <span>/</span>
              <span className="text-[#0F172A] font-medium">University Innovation Cell</span>
              <span>/</span>
              <span className="text-[#64748B]">Command Dashboard</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] tracking-tight">
                University Innovation & Research Cell (UIRC)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
              National Institutional Triage, Problem Statement Allocation, and Capstone R&D Monitoring
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#166534] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-[#166534]" />
              <span>AICTE / NIRF Accredited Institution</span>
            </span>
            <Link
              href="/university/assigned-problems"
              className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>View Assigned Problems</span>
            </Link>
          </div>
        </div>

        {/* Standardized 5-Card Government KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <KpiCard
            label="Assigned Challenges"
            value={totalAssignedChallenges}
            subtitle="From District Authorities"
            icon={<FileText className="h-5 w-5" />}
          />
          <KpiCard
            label="Active Projects"
            value={activeProjectsCount}
            subtitle="In Lab & Field Stages"
            trend="Active R&D"
            trendType="positive"
            icon={<Layers className="h-5 w-5" />}
          />
          <KpiCard
            label="Faculty Mentors"
            value={facultyMentorsCount}
            subtitle="Research Guides"
            icon={<GraduationCap className="h-5 w-5" />}
          />
          <KpiCard
            label="Student Teams"
            value={studentTeamsCount}
            subtitle="Multidisciplinary Squads"
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            label="Completed Solutions"
            value={completedSolutionsCount}
            subtitle="Deployed & Handed Over"
            trend="100% Impact"
            trendType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Visual Workflow Stepper: Visual Storytelling of Academic Solution Delivery */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-3 flex items-center justify-between">
            <span>Academic Solution Delivery Pipeline</span>
            <span className="text-[#64748B] font-normal">State Academic Innovation Framework</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#166534] font-semibold flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-[#16A34A]">Step 1</span>
              <span className="mt-0.5">Citizen Challenge</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#166534] font-semibold flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-[#16A34A]">Step 2</span>
              <span className="mt-0.5">University Receives</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B]">Step 3</span>
              <span className="mt-0.5">Faculty Assigned</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B]">Step 4</span>
              <span className="mt-0.5">Student Squad Formed</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-medium flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B]">Step 5</span>
              <span className="mt-0.5">Project Tracked</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#166534] font-semibold flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-[#16A34A]">Step 6</span>
              <span className="mt-0.5">Solution Delivered</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Column (Assigned Problems & Projects) & Right Column (Faculty & Department Stats) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Assigned Problems & Active Project Register */}
          <div className="lg:col-span-8 space-y-6">
            {/* Table 1: Recently Assigned Challenges */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs overflow-hidden">
              <div className="bg-[#EEF2F7] px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                    Assigned Problem Statements
                  </h2>
                </div>
                <Link
                  href="/university/assigned-problems"
                  className="text-xs font-semibold text-[#166534] hover:underline inline-flex items-center gap-1"
                >
                  <span>View All ({assignments.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0] uppercase text-[11px]">
                      <th className="py-2.5 px-4">Ref ID</th>
                      <th className="py-2.5 px-4">Problem Statement</th>
                      <th className="py-2.5 px-4">Sector</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Faculty Guide</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {assignments.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-[#64748B]">
                          {item.challengeId.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#0F172A] max-w-xs truncate">
                          <Link
                            href={`/citizen/report/${item.challengeId}`}
                            className="hover:text-[#166534] hover:underline"
                          >
                            {item.challengeTitle}
                          </Link>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#EEF2F7] border border-[#E2E8F0] text-[#0F172A] text-[11px] font-medium">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-md text-[11px] font-semibold border",
                              item.status === "CLAIMED"
                                ? "bg-emerald-50 text-[#166534] border-emerald-200"
                                : item.status === "DEPARTMENT_ASSIGNED"
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : item.status === "ACTIVE_RESEARCH"
                                ? "bg-emerald-50 text-[#166534] border-emerald-200"
                                : "bg-slate-100 text-[#475569] border-[#E2E8F0]"
                            )}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-[#475569]">
                          {item.leadFacultyName || (
                            <span className="text-amber-700 italic font-medium">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/citizen/report/${item.challengeId}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] hover:underline"
                          >
                            <span>View</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Active Capstone R&D Projects */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs overflow-hidden">
              <div className="bg-[#EEF2F7] px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                    Active Capstone & Research Projects
                  </h2>
                </div>
                <Link
                  href="/university/projects"
                  className="text-xs font-semibold text-[#166534] hover:underline inline-flex items-center gap-1"
                >
                  <span>Project Register ({projects.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#475569] font-bold border-b border-[#E2E8F0] uppercase text-[11px]">
                      <th className="py-2.5 px-4">Project Title</th>
                      <th className="py-2.5 px-4">Student Squad</th>
                      <th className="py-2.5 px-4">Faculty Mentor</th>
                      <th className="py-2.5 px-4">Stage</th>
                      <th className="py-2.5 px-4">Progress</th>
                      <th className="py-2.5 px-4 text-right">Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {projects.slice(0, 4).map((p) => (
                      <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 font-medium text-[#0F172A] max-w-xs truncate">
                          <Link
                            href={`/university/projects/${p.id}`}
                            className="hover:text-[#166534] hover:underline"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-[#475569] whitespace-nowrap">{p.teamName}</td>
                        <td className="py-3 px-4 text-[#475569] whitespace-nowrap">
                          {p.facultyMentorName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#166534] font-semibold text-[11px]">
                            {p.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-[#EEF2F7] rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#16A34A] h-2 rounded-full"
                                style={{ width: `${p.progressPercentage}%` }}
                              />
                            </div>
                            <span className="font-bold text-[#0F172A] text-[11px]">
                              {p.progressPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/university/projects/${p.id}`}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#166534] hover:bg-emerald-100 font-semibold text-xs transition-colors"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Faculty Workload, Department Allocation & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Academic Administration Actions
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/university/assigned-problems"
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-emerald-50/50 hover:border-emerald-200 text-xs font-semibold text-[#0F172A] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#166534]" />
                    <span>Assign Faculty to Problem</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#64748B]" />
                </Link>

                <Link
                  href="/university/faculty"
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-emerald-50/50 hover:border-emerald-200 text-xs font-semibold text-[#0F172A] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#166534]" />
                    <span>Faculty Workload Register</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#64748B]" />
                </Link>

                <Link
                  href="/university/students"
                  className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-emerald-50/50 hover:border-emerald-200 text-xs font-semibold text-[#0F172A] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#166534]" />
                    <span>Student Roster & Squads</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#64748B]" />
                </Link>
              </div>
            </div>

            {/* Department Research Capacity */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-xs overflow-hidden">
              <div className="bg-[#EEF2F7] px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                  Department Capacity & Load
                </h3>
                <span className="text-[10px] text-[#64748B] font-medium">5 Departments</span>
              </div>

              <div className="p-4 space-y-3 text-xs">
                {[
                  { name: "Civil & Environmental", projects: 6, faculty: 9, capacity: "82%" },
                  { name: "Computer Science & AI", projects: 8, faculty: 12, capacity: "90%" },
                  { name: "Mechanical & Robotics", projects: 4, faculty: 7, capacity: "65%" },
                  { name: "Electrical & Renewable", projects: 5, faculty: 6, capacity: "78%" },
                  { name: "Biotechnology & Agriculture", projects: 3, faculty: 4, capacity: "55%" },
                ].map((dept) => (
                  <div key={dept.name} className="border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between font-semibold text-[#0F172A]">
                      <span>{dept.name}</span>
                      <span className="font-mono text-[#166534]">{dept.projects} Projects</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
                      <span>{dept.faculty} Active Mentors</span>
                      <span>Utilization: {dept.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* National Accreditation Notice */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#0F172A]">
                <ShieldCheck className="h-4 w-4 text-[#166534]" />
                <span>AICTE Academic Compliance</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                All assigned capstone problem statements adhere to national curriculum credit allocation standards. Student teams receive academic project credits upon verified deployment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

