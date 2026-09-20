"use client";

import React, { useState } from "react";
import {
  DeliverableType,
  ProjectMilestone,
} from "../types/project.types";
import { projectService } from "@/services/project.service";
import {
  X,
  UploadCloud,
  FileText,
  Cpu,
  Video,
  Code2,
  Database,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  projectId: string;
  projectTitle: string;
  milestones: ProjectMilestone[];
  preselectedMilestoneId?: string;
  uploaderName?: string;
}

const DELIVERABLE_TYPES: {
  type: DeliverableType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "DOCUMENT", label: "Research / Spec Document", icon: FileText },
  { type: "PROTOTYPE", label: "CAD / PCB / Hardware Model", icon: Cpu },
  { type: "VIDEO_DEMO", label: "Field Video / Lab Demo", icon: Video },
  { type: "SOURCE_CODE", label: "Firmware / Algorithm Repo", icon: Code2 },
  { type: "PILOT_DATA", label: "Live Telemetry / Sensor Logs", icon: Database },
];

export function UploadDeliverableModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectTitle,
  milestones,
  preselectedMilestoneId,
  uploaderName = "Aarav Sharma",
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DeliverableType>("DOCUMENT");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    preselectedMilestoneId || (milestones.length > 0 ? milestones[0].id : "")
  );
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("4.5 MB");
  const [version, setVersion] = useState("v1.0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in deliverable title and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await projectService.uploadDeliverable(projectId, {
        milestoneId: selectedMilestoneId || undefined,
        title: title.trim(),
        description: description.trim(),
        type,
        fileUrl: fileUrl.trim() || `https://sicp.gov.in/deliverables/${title.toLowerCase().replace(/\s+/g, "-")}`,
        fileName: fileName.trim() || `${title.replace(/\s+/g, "_")}_${version}.pdf`,
        fileSize: fileSize.trim() || "5.2 MB",
        version: version.trim() || "v1.0",
        uploadedBy: uploaderName,
        uploadedByRole: "Team Lead",
      });
      onSuccess(`Deliverable "${title}" submitted successfully for faculty review!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload deliverable.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Submit Project Deliverable
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {projectTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Deliverable Type Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Deliverable Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DELIVERABLE_TYPES.map((dt) => {
                const IconComponent = dt.icon;
                const isSelected = type === dt.type;
                return (
                  <button
                    key={dt.type}
                    type="button"
                    onClick={() => setType(dt.type)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-glow-sm"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-semibold truncate">{dt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Deliverable Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ansys FEA Thermal Simulation & VIP Casing Benchmark"
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          {/* Linked Milestone */}
          {milestones.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Attach to Milestone (Optional)
              </label>
              <select
                value={selectedMilestoneId}
                onChange={(e) => setSelectedMilestoneId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <option value="">-- General Project Deliverable --</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.stage}] {m.title} ({m.progressPercentage}% done)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Link & Version */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Artifact URL / Demo Link
              </label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/.. or https://github.com/.."
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Version Tag
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Evidence Summary & Verification Notes <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail experimental methodology, hardware bill of materials, test logs, or demo timestamps..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Submit for Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
