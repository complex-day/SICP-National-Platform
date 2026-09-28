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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                Upload Field Pilot Evidence
              </h3>
              <p className="text-xs text-[#475569] truncate max-w-[280px]">
                {deployment.locationName} ({deployment.district})
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
              Evidence Document / Artifact Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Solar Inverter Commissioning Photo & Gram Panchayat Endorsement"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              required
            />
          </div>

          {/* Evidence Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Evidence Category <span className="text-rose-600">*</span>
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
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 border-[#166534] text-[#166534] font-semibold shadow-xs"
                        : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
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
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
              <Link2 className="h-3 w-3 text-[#64748B]" />
              Evidence URL / Secure Cloud Artifact Link <span className="text-rose-600">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://sicp.gov.in/evidence/..."
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              required
            />
          </div>

          {/* Uploaded By */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Uploaded By / Field Officer Designation <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
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
