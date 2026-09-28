"use client";

import React, { useState } from "react";
import { ProjectMilestone } from "../types/project.types";
import { projectService } from "@/services/project.service";
import {
  X,
  Award,
  Sliders,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
  GraduationCap,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  projectId: string;
  projectTitle: string;
  facultyName?: string;
  facultyInstitution?: string;
  milestones?: ProjectMilestone[];
  preselectedMilestoneId?: string;
}

export function FacultyReviewModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectTitle,
  facultyName = "Dr. Ramesh Verma",
  facultyInstitution = "IIT Roorkee",
  milestones = [],
  preselectedMilestoneId,
}: Props) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    preselectedMilestoneId || (milestones.length > 0 ? milestones[0].id : "")
  );
  const [status, setStatus] = useState<"APPROVED" | "REVISION_REQUESTED" | "REJECTED">(
    "APPROVED"
  );
  const [innovation, setInnovation] = useState<number>(23);
  const [prototype, setPrototype] = useState<number>(22);
  const [validation, setValidation] = useState<number>(23);
  const [docs, setDocs] = useState<number>(24);
  const [comments, setComments] = useState("");
  const [strengthsText, setStrengthsText] = useState("Rigorous mathematical model; low component cost.");
  const [improvementsText, setImprovementsText] = useState("Validate IP68 waterproofing under higher pressure.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalScore = innovation + prototype + validation + docs;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setError("Please write detailed review feedback and assessment notes.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await projectService.submitFacultyReview(projectId, {
        milestoneId: selectedMilestoneId || undefined,
        reviewerId: "fac-current",
        reviewerName: facultyName,
        reviewerDesignation: "Faculty Mentor / Research Chair",
        reviewerDepartment: "Engineering R&D Committee",
        reviewerInstitution: facultyInstitution,
        status,
        rubric: {
          innovationFeasibility: innovation,
          prototypeMaturity: prototype,
          fieldValidation: validation,
          technicalDocumentation: docs,
        },
        comments: comments.trim(),
        strengths: strengthsText
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean),
        improvements: improvementsText
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      onSuccess(`Faculty evaluation submitted with score ${totalScore}/100!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                Faculty Milestone & Deliverable Review
              </h3>
              <p className="text-xs text-[#475569] truncate max-w-[280px]">
                {projectTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Decision Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0F172A]">
              Review Outcome & Verification Decision <span className="text-rose-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus("APPROVED")}
                className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  status === "APPROVED"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Approve & Verify</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("REVISION_REQUESTED")}
                className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  status === "REVISION_REQUESTED"
                    ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Request Revision</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("REJECTED")}
                className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  status === "REJECTED"
                    ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject Milestone</span>
              </button>
            </div>
          </div>

          {/* Linked Milestone */}
          {milestones.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                Target Milestone
              </label>
              <select
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              >
                <option value="">-- General Project Review --</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.stage}] {m.title} ({m.progressPercentage}% done)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 4-Factor Rubric Sliders */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#166534]" />
                Statutory Scoring Rubric (Max 25 pts each)
              </h4>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-[#166534]">
                <span>{totalScore}</span>
                <span className="text-[#64748B] text-xs font-normal">/ 100</span>
              </div>
            </div>

            {/* Slider 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#475569] font-medium">
                  Innovation & Feasibility (0-25)
                </span>
                <span className="font-mono font-bold text-[#0F172A]">{innovation} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={innovation}
                onChange={(e) => setInnovation(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#166534]"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#475569] font-medium">
                  Prototype Maturity & CAD/Code Quality (0-25)
                </span>
                <span className="font-mono font-bold text-[#0F172A]">{prototype} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={prototype}
                onChange={(e) => setPrototype(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#166534]"
              />
            </div>

            {/* Slider 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#475569] font-medium">
                  Field Validation & Stress Tests (0-25)
                </span>
                <span className="font-mono font-bold text-[#0F172A]">{validation} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={validation}
                onChange={(e) => setValidation(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#166534]"
              />
            </div>

            {/* Slider 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#475569] font-medium">
                  Technical Documentation & Schema (0-25)
                </span>
                <span className="font-mono font-bold text-[#0F172A]">{docs} pts</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={docs}
                onChange={(e) => setDocs(Number(e.target.value))}
                className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#166534]"
              />
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Reviewer Evaluation Notes & Assessment <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="State experimental findings, mathematical validations, and structural robustness feedback..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] resize-none"
              required
            />
          </div>

          {/* Key Strengths & Improvements */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                Key Strengths (semicolon separated)
              </label>
              <input
                type="text"
                value={strengthsText}
                onChange={(e) => setStrengthsText(e.target.value)}
                placeholder="High sensor accuracy; low cost"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                Recommended Actions
              </label>
              <input
                type="text"
                value={improvementsText}
                onChange={(e) => setImprovementsText(e.target.value)}
                placeholder="Test battery drain; seal IP68"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comments.trim()}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting Evaluation...
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  Submit Evaluation ({totalScore}/100)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
