"use client";

import React, { useState } from "react";
import { PilotDeployment } from "../types/partnership.types";
import { partnershipService } from "@/services/partnership.service";
import {
  X,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Loader2,
  Sparkles,
  Link2,
  Camera,
  Activity,
  FileText,
  ClipboardList,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  partnershipId: string;
  deployment: PilotDeployment | null;
}

export function PilotEvidenceModal({
  isOpen,
  onClose,
  onSuccess,
  partnershipId,
  deployment,
}: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"PHOTO" | "TELEMETRY_LOG" | "MOU_COPY" | "FIELD_SURVEY">(
    "PHOTO"
  );
  const [url, setUrl] = useState("https://sicp.gov.in/evidence/field-test-report.pdf");
  const [uploadedBy, setUploadedBy] = useState("Field Lead / Project Officer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !deployment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !uploadedBy.trim()) {
      setError("Please complete all required evidence fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await partnershipService.recordPilotEvidence(partnershipId, deployment.id, {
        title: title.trim(),
        type,
        url: url.trim(),
        uploadedBy: uploadedBy.trim(),
      });

      onSuccess(`Field evidence "${title}" added to ${deployment.locationName}!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record pilot evidence.";
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
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Upload Field Pilot Evidence
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {deployment.locationName} ({deployment.district})
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

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Evidence Document / Artifact Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Solar Inverter Commissioning Photo & Gram Panchayat Endorsement"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          {/* Evidence Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Evidence Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "PHOTO" as const, label: "Field Photo", icon: Camera },
                { type: "TELEMETRY_LOG" as const, label: "Telemetry Log", icon: Activity },
                { type: "MOU_COPY" as const, label: "Site MoA / Agreement", icon: FileText },
                { type: "FIELD_SURVEY" as const, label: "Impact Survey", icon: ClipboardList },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setType(item.type)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* URL / Artifact link */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Link2 className="h-3 w-3 text-muted-foreground" />
              Evidence URL / Secure Cloud Artifact Link <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://sicp.gov.in/evidence/..."
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          {/* Uploaded By */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Uploaded By / Field Officer Designation <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
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
                  Saving Artifact...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Record Evidence
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
