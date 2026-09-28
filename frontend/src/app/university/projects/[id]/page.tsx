"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { projectService } from "@/services/project.service";
import { Project, ProjectMilestone, ProjectDeliverable, FacultyReview } from "@/features/project/types/project.types";
import {
  Layers,
  FileText,
  Users,
  GraduationCap,
  CheckCircle2,
  Clock,
  Download,
  UploadCloud,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  AlertCircle,
  Calendar,
  Sparkles,
  Plus,
  FileCheck,
  ChevronRight,
  X,
  Send,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UniversityProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isUploadDeliverableOpen, setIsUploadDeliverableOpen] = useState(false);

  // Deliverable upload state
  const [delivTitle, setDelivTitle] = useState("");
  const [delivDesc, setDelivDesc] = useState("");
  const [delivType, setDelivType] = useState<ProjectDeliverable["type"]>("DOCUMENT");

  // Faculty Review state
  const [rubricFeasibility, setRubricFeasibility] = useState(23);
  const [rubricPrototype, setRubricPrototype] = useState(22);
  const [rubricField, setRubricField] = useState(24);
  const [rubricDoc, setRubricDoc] = useState(24);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REVISION_REQUESTED">("APPROVED");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadProject = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getProjectById(id);
      setProject(data);
    } catch (err: any) {
      setError(err.message || "Failed to load project workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      setIsSubmittingReview(true);
      await projectService.submitFacultyReview(project.id, {
        reviewerId: "fac-current",
        reviewerName: project.facultyMentorName || "Dr. Rajesh Sharma",
        reviewerDesignation: "Principal Research Investigator",
        reviewerDepartment: "Department of Environmental Engineering",
        reviewerInstitution: project.facultyMentorInstitution || "Birla Institute of Technology, Mesra",
        status: reviewStatus,
        rubric: {
          innovationFeasibility: rubricFeasibility,
          prototypeMaturity: rubricPrototype,
          fieldValidation: rubricField,
          technicalDocumentation: rubricDoc,
        },
        comments: reviewComments || "The prototype demonstrates rigorous adherence to field site parameters. Lab tests confirm a 98% reduction in target contaminants.",
        strengths: ["Robust circuit isolation", "Standardized sensor calibration", "Comprehensive field logs"],
        improvements: ["Ensure weather-sealed enclosure for monsoon deployment"],
      });

      setIsReviewModalOpen(false);
      loadProject();
    } catch (err: any) {
      alert(err.message || "Failed to record faculty review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    try {
      await projectService.uploadDeliverable(project.id, {
        title: delivTitle || "Technical Architecture & Schematics PDF",
        description: delivDesc || "Full engineering schematics and simulation benchmarks for lab prototype.",
        type: delivType,
        fileUrl: "https://example.gov.in/docs/schematic-v2.pdf",
        fileName: `${delivTitle.toLowerCase().replace(/\s+/g, "-") || "deliverable-doc"}.pdf`,
        fileSize: "4.2 MB",
        version: "v1.2",
        uploadedBy: project.teamLeadName || "Rahul Verma",
        uploadedByRole: "Student Squad Lead",
      });

      setIsUploadDeliverableOpen(false);
      setDelivTitle("");
      setDelivDesc("");
      loadProject();
    } catch (err: any) {
      alert(err.message || "Failed to upload deliverable.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requireAuth={false}>
        <div className="py-24 text-center space-y-3">
          <div className="h-8 w-8 border-3 border-[#166534] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-gray-700">
            Initializing Academic Project Workspace...
          </div>
          <p className="text-xs text-gray-500">Loading milestone timeline, deliverables, and faculty review rubrics.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout requireAuth={false}>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-10 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Project Not Found</h2>
          <p className="text-xs text-gray-600">The requested academic research project does not exist.</p>
          <Link
            href="/university/projects"
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#166534] text-white text-xs font-semibold rounded"
          >
            &larr; Back to Projects Monitoring
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate default / mock milestone stages for government academic workflow
  const standardMilestones = [
    {
      stage: "Stage 1: Research",
      title: "Field Site Survey & Problem Formulation",
      desc: "Literature review, municipal water sample chemical assays, and baseline testing.",
      status: "VERIFIED",
      progress: 100,
    },
    {
      stage: "Stage 2: Problem Analysis",
      title: "Technical Architecture & Mathematical Modeling",
      desc: "Circuit schematics, filtration flow equations, and system specification sign-off.",
      status: "VERIFIED",
      progress: 100,
    },
    {
      stage: "Stage 3: Prototype Design",
      title: "Hardware & Software Prototype Fabrication",
      desc: "Benchtop prototype construction, embedded sensor firmware, and telemetry testing.",
      status: "IN_PROGRESS",
      progress: 75,
    },
    {
      stage: "Stage 4: Testing",
      title: "Lab Safety & Community Field Trials",
      desc: "Simulated load testing and on-site pilot trials in designated village ward.",
      status: "PENDING",
      progress: 0,
    },
    {
      stage: "Stage 5: Deployment",
      title: "Municipal Handover & Impact Assessment",
      desc: "District Nodal Officer validation and long-term maintenance documentation.",
      status: "PENDING",
      progress: 0,
    },
  ];

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        {/* Workspace Header & Action Bar */}
        <div className="border-b border-[#E2E8F0] pb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-[#166534]">Portal</Link>
              <span>/</span>
              <Link href="/university/dashboard" className="hover:text-[#166534]">University Command</Link>
              <span>/</span>
              <Link href="/university/projects" className="hover:text-[#166534]">Projects</Link>
              <span>/</span>
              <span className="font-mono text-gray-800 font-semibold">{project.id.slice(0, 10).toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold bg-gray-100 px-2.5 py-1 rounded border border-gray-300 text-gray-700">
                PROJ-ID: {project.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Stage: {project.stage}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-1.5 max-w-4xl">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#212121] tracking-tight">
                {project.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                <span className="font-semibold text-[#166534] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {project.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <GraduationCap className="h-3.5 w-3.5 text-[#166534]" />
                  Mentor: {project.facultyMentorName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="h-3.5 w-3.5 text-gray-500" />
                  Squad: {project.teamName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsUploadDeliverableOpen(true)}
                className="px-3.5 py-2 rounded bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5 transition-colors"
              >
                <UploadCloud className="h-3.5 w-3.5 text-gray-500" />
                <span>Upload Deliverable</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2 rounded bg-[#166534] hover:bg-[#083b7a] text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Award className="h-3.5 w-3.5 text-[#F57C00]" />
                <span>Submit Faculty Evaluation</span>
              </button>
            </div>
          </div>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 8-Cols Left Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Project Information & Scope */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    Academic Scope & Problem Formulation
                  </h2>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">AICTE Capstone Grant</span>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {project.description || project.synopsis}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="bg-slate-50 border rounded p-2.5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Sponsoring Problem</span>
                    <div className="font-semibold text-gray-900 mt-0.5 truncate">{project.challengeTitle}</div>
                  </div>
                  <div className="bg-slate-50 border rounded p-2.5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Grant Allocation</span>
                    <div className="font-bold text-emerald-800 mt-0.5">₹2.50 Lakhs (State / CSR Grant)</div>
                  </div>
                  <div className="bg-slate-50 border rounded p-2.5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Target Completion</span>
                    <div className="font-semibold text-gray-900 mt-0.5">
                      {new Date(project.targetCompletionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Phase 3.8: Vertical Milestone Timeline Flow */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    Milestone Progress Timeline
                  </h2>
                </div>
                <span className="text-[11px] text-[#2E7D32] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Overall Completion: {project.progressPercentage}%
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {standardMilestones.map((m, idx) => (
                    <div key={idx} className="relative">
                      {/* Node circle */}
                      <div
                        className={cn(
                          "absolute -left-[27px] top-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold",
                          m.status === "VERIFIED"
                            ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                            : m.status === "IN_PROGRESS"
                            ? "bg-[#166534] border-[#166534] text-white ring-4 ring-blue-100 animate-pulse"
                            : "bg-white border-gray-300 text-gray-400"
                        )}
                      >
                        {m.status === "VERIFIED" ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                      </div>

                      <div className="border border-[#E2E8F0] rounded-md p-4 bg-gray-50/60 space-y-2 hover:bg-white transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#166534] tracking-wide block">
                              {m.stage}
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900">{m.title}</h3>
                          </div>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              m.status === "VERIFIED"
                                ? "bg-emerald-100 text-[#1b5e20] border border-emerald-300"
                                : m.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-[#166534] border border-blue-300"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            )}
                          >
                            {m.status.replace("_", " ")}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>

                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                          <span>Milestone Weightage: 20%</span>
                          <span className="font-semibold text-gray-800">{m.progress}% Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Deliverables & Technical Documents */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    Technical Deliverables & Code Repositories ({project.deliverables?.length || 2})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadDeliverableOpen(true)}
                  className="text-xs text-[#166534] hover:underline font-semibold"
                >
                  + Add File
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                {/* Default mock deliverable records */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-[#E2E8F0] rounded text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#166534]" />
                      <span>Technical Architecture & PCB Schematics.pdf</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Uploaded by {project.teamLeadName} • v1.2 (4.2 MB) • Verified by Faculty Guide
                    </div>
                  </div>
                  <button className="px-2.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-semibold text-[#166534] hover:bg-blue-50">
                    Download
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-[#E2E8F0] rounded text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-[#166534]" />
                      <span>Embedded Firmware & Sensor Telemetry Codebase</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      GitHub Repository • branch: main (commit: #7a8f01c)
                    </div>
                  </div>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] rounded text-[11px] font-semibold text-[#166534] hover:bg-emerald-50"
                  >
                    View Code
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar 4-Cols Right Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Team Members & Faculty Mentors */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#166534]" />
                  <span>Research Squad & Faculty</span>
                </h3>
              </div>

              <div className="p-4 space-y-3.5 text-xs">
                {/* Faculty Mentor */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#166534] block">
                    Principal Faculty Guide
                  </span>
                  <div className="font-bold text-gray-900 text-sm">{project.facultyMentorName}</div>
                  <div className="text-[11px] text-gray-600">{project.facultyMentorInstitution}</div>
                </div>

                {/* Team Lead */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Student Squad Leader</span>
                  <div className="font-bold text-gray-900 mt-0.5">{project.teamLeadName}</div>
                  <div className="text-[11px] text-gray-500">Squad: {project.teamName} (4 Student Researchers)</div>
                </div>

                {/* Student Squad members */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Multidisciplinary Members</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Pooja Sharma</span>
                      <span className="text-gray-500">Civil & Environmental</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Vikram Singh</span>
                      <span className="text-gray-500">Electrical & IoT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">Anand Kumar</span>
                      <span className="text-gray-500">Mechanical CAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Evaluation Rubric Summary */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-[#F57C00]" />
                  <span>Faculty Evaluation Rubric</span>
                </h3>
                <span className="text-xs font-bold text-[#166534]">93 / 100</span>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Innovation & Feasibility:</span>
                    <strong className="text-gray-900">23 / 25</strong>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#166534] h-1.5 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Prototype Maturity:</span>
                    <strong className="text-gray-900">22 / 25</strong>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#2E7D32] h-1.5 rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Field Site Validation:</span>
                    <strong className="text-gray-900">24 / 25</strong>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F57C00] h-1.5 rounded-full" style={{ width: "96%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Technical Documentation:</span>
                    <strong className="text-gray-900">24 / 25</strong>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0369A1] h-1.5 rounded-full" style={{ width: "96%" }} />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full py-2 bg-[#166534] hover:bg-[#083b7a] text-white text-xs font-bold rounded transition-colors shadow-2xs"
                  >
                    Submit / Update Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL 1: Faculty Review Submission */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-md max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#166534]" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Faculty Milestone Evaluation Rubric
                  </h3>
                </div>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                      Innovation & Feasibility (/25)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={rubricFeasibility}
                      onChange={(e) => setRubricFeasibility(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                      Prototype Maturity (/25)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={rubricPrototype}
                      onChange={(e) => setRubricPrototype(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                      Field Site Validation (/25)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={rubricField}
                      onChange={(e) => setRubricField(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                      Technical Documentation (/25)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={rubricDoc}
                      onChange={(e) => setRubricDoc(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Faculty Evaluation Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter formal academic assessment and feedback for the student research squad..."
                    className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Evaluation Verdict
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                  >
                    <option value="APPROVED">Approved (Milestone Verified)</option>
                    <option value="REVISION_REQUESTED">Revision Requested</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-1.5 bg-[#166534] hover:bg-[#083b7a] text-white font-bold rounded shadow-xs"
                  >
                    {isSubmittingReview ? "Recording..." : "Authenticate & Sign Off"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Upload Deliverable */}
        {isUploadDeliverableOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-md max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-[#166534]" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Upload Capstone Deliverable
                  </h3>
                </div>
                <button onClick={() => setIsUploadDeliverableOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleDeliverableSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Deliverable Document Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={delivTitle}
                    onChange={(e) => setDelivTitle(e.target.value)}
                    required
                    placeholder="e.g. Field Trial Water Quality Certificate"
                    className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Deliverable Type
                  </label>
                  <select
                    value={delivType}
                    onChange={(e) => setDelivType(e.target.value as any)}
                    className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                  >
                    <option value="DOCUMENT">Technical Report / PDF</option>
                    <option value="CODE_REPO">Source Code Repository</option>
                    <option value="DATASET">Experimental Dataset</option>
                    <option value="VIDEO">Field Video Recording</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                    Description & Change Notes
                  </label>
                  <textarea
                    rows={2}
                    value={delivDesc}
                    onChange={(e) => setDelivDesc(e.target.value)}
                    placeholder="Briefly state testing parameters and methodology..."
                    className="w-full p-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadDeliverableOpen(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#166534] hover:bg-[#083b7a] text-white font-bold rounded shadow-xs"
                  >
                    Upload to Repository
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
