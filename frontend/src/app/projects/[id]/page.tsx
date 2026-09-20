"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, KPICard } from "@/components/ui";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { projectService } from "@/services/project.service";
import {
  Project,
  ProjectStage,
  ProjectMilestone,
  ProjectDeliverable,
  FacultyReview,
} from "@/features/project/types/project.types";
import {
  ProjectStageBadge,
  MilestoneStatusBadge,
  ProjectStageStepper,
  CreateMilestoneModal,
  UploadDeliverableModal,
  FacultyReviewModal,
  ProjectAnalyticsCard,
} from "@/features/project/components";
import {
  Layers,
  Users,
  GraduationCap,
  Calendar,
  Target,
  FileText,
  UploadCloud,
  Award,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Plus,
  ArrowLeft,
  DollarSign,
  Cpu,
  Video,
  Code2,
  Database,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active Tab: MILESTONES | DELIVERABLES | REVIEWS | ANALYTICS
  const [activeTab, setActiveTab] = useState<
    "MILESTONES" | "DELIVERABLES" | "REVIEWS" | "ANALYTICS"
  >("MILESTONES");

  // Modals
  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  const [isUploadDeliverableOpen, setIsUploadDeliverableOpen] = useState(false);
  const [isFacultyReviewOpen, setIsFacultyReviewOpen] = useState(false);
  const [selectedMilestoneForReview, setSelectedMilestoneForReview] = useState<string | undefined>(undefined);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getProjectById(projectId);
      if (!data) {
        setError("Project not found in registry.");
      } else {
        setProject(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load project.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const handleActionSuccess = (message: string) => {
    setSuccessToast(message);
    loadProject();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleAdvanceStage = async (nextStage: ProjectStage) => {
    try {
      await projectService.updateProjectStage(projectId, nextStage);
      handleActionSuccess(`Project successfully advanced to ${nextStage} stage!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to advance stage.";
      setSuccessToast(msg);
    }
  };

  const handleQuickVerifyMilestone = async (milestoneId: string) => {
    try {
      await projectService.updateMilestoneProgress(
        projectId,
        milestoneId,
        100,
        "VERIFIED",
        "Directly verified by Faculty Lead."
      );
      handleActionSuccess("Milestone marked as Verified (100% progress).");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify milestone.";
      setSuccessToast(msg);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Innovation Project Workspace..." />
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Project Not Found"
          message={error || "Could not retrieve project workspace details."}
          onRetry={loadProject}
        />
      </DashboardLayout>
    );
  }

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

        {/* Top Back Link & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Project Registry
          </Link>
          <ProjectStageBadge stage={project.stage} />
        </div>

        {/* Page Header */}
        <PageHeader
          title={project.title}
          description={project.synopsis}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {project.category}
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadDeliverableOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center gap-1.5 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Deliverable
              </button>
              <button
                onClick={() => {
                  setSelectedMilestoneForReview(undefined);
                  setIsFacultyReviewOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-1.5 transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                Evaluate & Review
              </button>
            </div>
          }
        />

        {/* 4-Stage Stepper Workflow */}
        <ProjectStageStepper
          currentStage={project.stage}
          onAdvanceStage={handleAdvanceStage}
          canAdvance={true}
        />

        {/* Project Meta Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Linked Challenge Card */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Problem Statement
            </span>
            <h4 className="font-semibold text-sm text-foreground">
              {project.challengeTitle}
            </h4>
            <Link
              href="/challenges"
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 mt-1"
            >
              View Challenge Spec <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Linked Team Card */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Student Capstone Team
            </span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">
                {project.teamName}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Lead: <span className="text-foreground font-medium">{project.teamLeadName}</span> · {project.teamMembersCount} Members
            </p>
          </div>

          {/* Faculty Mentor Card */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Principal Investigator / Mentor
            </span>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-sm text-foreground">
                {project.facultyMentorName}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              {project.facultyMentorInstitution}
            </p>
          </div>
        </div>

        {/* Repository & Demo Links */}
        {(project.repoUrl || project.demoUrl) && (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground hover:text-primary flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Code2 className="w-4 h-4 text-primary" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Live Pilot Prototype</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {project.budgetAllocated && (
              <div className="flex items-center gap-2 font-mono text-muted-foreground">
                <span>R&D Grant:</span>
                <span className="font-bold text-foreground">
                  ₹{(project.budgetAllocated / 100000).toFixed(1)} Lakhs
                </span>
              </div>
            )}
          </div>
        )}

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("MILESTONES")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "MILESTONES"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Milestones ({project.milestones.length})
          </button>

          <button
            onClick={() => setActiveTab("DELIVERABLES")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "DELIVERABLES"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Deliverables & Evidence ({project.deliverables.length})
          </button>

          <button
            onClick={() => setActiveTab("REVIEWS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "REVIEWS"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Faculty Evaluations ({project.reviews.length})
          </button>

          <button
            onClick={() => setActiveTab("ANALYTICS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "ANALYTICS"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Velocity & Burn-Down
          </button>
        </div>

        {/* TAB 1: MILESTONES */}
        {activeTab === "MILESTONES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Project Milestones & Completion Validation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Stage-wise progress, deliverable criteria, and faculty sign-offs
                </p>
              </div>
              <button
                onClick={() => setIsCreateMilestoneOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {project.milestones.map((ms, idx) => {
                const isVerified = ms.status === "VERIFIED";
                return (
                  <div
                    key={ms.id}
                    className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">
                            {ms.title}
                          </h4>
                          <span className="text-[11px] font-medium text-primary uppercase">
                            [{ms.stage} STAGE]
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MilestoneStatusBadge status={ms.status} />
                        <span className="text-xs font-mono font-bold text-foreground">
                          {ms.progressPercentage}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ms.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isVerified ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{ width: `${ms.progressPercentage}%` }}
                      />
                    </div>

                    {/* Meta & Actions */}
                    <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(ms.targetDate).toLocaleDateString()}
                        </span>
                        {ms.assignedMemberName && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Assigned: {ms.assignedMemberName}
                          </span>
                        )}
                        <span>{ms.deliverablesCount} Deliverables</span>
                        {ms.reviewScore !== undefined && (
                          <span className="font-mono font-bold text-emerald-400">
                            Score: {ms.reviewScore}/100
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMilestoneForReview(ms.id);
                            setIsUploadDeliverableOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                        >
                          Submit Artifact
                        </button>
                        {!isVerified && (
                          <button
                            onClick={() => handleQuickVerifyMilestone(ms.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 text-[11px] font-semibold transition-colors"
                          >
                            Verify (100%)
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMilestoneForReview(ms.id);
                            setIsFacultyReviewOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 shadow-glow-sm transition-all"
                        >
                          Evaluate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DELIVERABLES */}
        {activeTab === "DELIVERABLES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Project Deliverables & Verification Evidence
                </h3>
                <p className="text-xs text-muted-foreground">
                  Document specs, prototype models, demo videos, and version history
                </p>
              </div>
              <button
                onClick={() => setIsUploadDeliverableOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-1.5 transition-all"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Deliverable
              </button>
            </div>

            {project.deliverables.length === 0 ? (
              <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-3">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="font-semibold text-sm text-foreground">
                  No Deliverables Uploaded Yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Upload research whitepapers, KiCad schematics, CAD STEP models, or field trial demo videos.
                </p>
                <button
                  onClick={() => setIsUploadDeliverableOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow transition-all"
                >
                  Upload First Artifact
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.deliverables.map((deliv) => {
                  const isApproved = deliv.verificationStatus === "APPROVED";
                  return (
                    <div
                      key={deliv.id}
                      className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-mono font-bold">
                            {deliv.type} · {deliv.version}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isApproved
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {deliv.verificationStatus}
                          </span>
                        </div>

                        <h4 className="font-semibold text-sm text-foreground">
                          {deliv.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {deliv.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-muted-foreground">
                          {deliv.fileName} ({deliv.fileSize})
                        </span>
                        <a
                          href={deliv.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Open File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FACULTY REVIEWS */}
        {activeTab === "REVIEWS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Faculty Milestone & Project Reviews
                </h3>
                <p className="text-xs text-muted-foreground">
                  Evaluation scoring across Innovation, Prototype Maturity, Field Validation, and Docs
                </p>
              </div>
              <button
                onClick={() => setIsFacultyReviewOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-1.5 transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                Add Faculty Evaluation
              </button>
            </div>

            {project.reviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-3">
                <Award className="w-8 h-8 text-muted-foreground mx-auto" />
                <h4 className="font-semibold text-sm text-foreground">
                  No Reviews Recorded Yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Assigned faculty mentors can review milestone submissions and submit statutory rubrics.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {project.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl bg-card border border-border space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {rev.reviewerName}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              rev.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {rev.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {rev.reviewerDesignation} · {rev.reviewerInstitution}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center">
                          <span className="text-xs text-muted-foreground block text-[10px] uppercase font-bold">
                            Total Score
                          </span>
                          <span className="font-mono text-lg font-black text-primary">
                            {rev.totalScore}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rubric Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-center">
                        <span className="text-[10px] text-muted-foreground block">
                          Innovation
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {rev.rubric.innovationFeasibility} / 25
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-center">
                        <span className="text-[10px] text-muted-foreground block">
                          Prototype
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {rev.rubric.prototypeMaturity} / 25
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-center">
                        <span className="text-[10px] text-muted-foreground block">
                          Validation
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {rev.rubric.fieldValidation} / 25
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-center">
                        <span className="text-[10px] text-muted-foreground block">
                          Documentation
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {rev.rubric.technicalDocumentation} / 25
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 italic leading-relaxed">
                      "{rev.comments}"
                    </p>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      {rev.strengths.length > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <span className="font-semibold text-emerald-400 block mb-1">
                            Key Strengths:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                            {rev.strengths.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rev.improvements.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                          <span className="font-semibold text-amber-400 block mb-1">
                            Recommended Improvements:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                            {rev.improvements.map((im, idx) => (
                              <li key={idx}>{im}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === "ANALYTICS" && (
          <div className="space-y-4">
            <ProjectAnalyticsCard analytics={project.analytics} />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateMilestoneModal
        isOpen={isCreateMilestoneOpen}
        onClose={() => setIsCreateMilestoneOpen(false)}
        onSuccess={handleActionSuccess}
        projectId={project.id}
        projectTitle={project.title}
        defaultStage={project.stage}
      />

      <UploadDeliverableModal
        isOpen={isUploadDeliverableOpen}
        onClose={() => setIsUploadDeliverableOpen(false)}
        onSuccess={handleActionSuccess}
        projectId={project.id}
        projectTitle={project.title}
        milestones={project.milestones}
        preselectedMilestoneId={selectedMilestoneForReview}
        uploaderName={project.teamLeadName}
      />

      <FacultyReviewModal
        isOpen={isFacultyReviewOpen}
        onClose={() => setIsFacultyReviewOpen(false)}
        onSuccess={handleActionSuccess}
        projectId={project.id}
        projectTitle={project.title}
        facultyName={project.facultyMentorName}
        facultyInstitution={project.facultyMentorInstitution}
        milestones={project.milestones}
        preselectedMilestoneId={selectedMilestoneForReview}
      />
    </DashboardLayout>
  );
}
