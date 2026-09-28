"use client";

import React, { useState } from "react";
import { ProjectStage, PROJECT_STAGES } from "../types/project.types";
import { projectService } from "@/services/project.service";
import {
  X,
  Target,
  Calendar,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  projectId: string;
  projectTitle: string;
  defaultStage?: ProjectStage;
}

export function CreateMilestoneModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectTitle,
  defaultStage = "DEVELOPMENT",
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<ProjectStage>(defaultStage);
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [assignedMember, setAssignedMember] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !targetDate) {
      setError("Please complete all required milestone fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await projectService.createMilestone(projectId, {
        title: title.trim(),
        description: description.trim(),
        stage,
        targetDate: new Date(targetDate).toISOString(),
        assignedMemberName: assignedMember.trim() || undefined,
      });
      onSuccess(`Milestone "${title}" added successfully!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create milestone.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                Create Project Milestone
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Milestone Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Submersible IP68 Enclosure & PCB Fabrication"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              required
            />
          </div>

          {/* Stage & Target Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                Lifecycle Stage <span className="text-rose-600">*</span>
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ProjectStage)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              >
                {PROJECT_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#166534]" />
                Target Due Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                required
              />
            </div>
          </div>

          {/* Assigned Lead */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#64748B]" />
              Assigned Member / Lead (Optional)
            </label>
            <input
              type="text"
              value={assignedMember}
              onChange={(e) => setAssignedMember(e.target.value)}
              placeholder="e.g., Sneha Patil (Hardware Lead)"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Milestone Scope & Deliverable Criteria <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific test requirements, accuracy tolerances, or fabrication artifacts required for verification..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] resize-none"
              required
            />
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
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating Milestone...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Create Milestone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
