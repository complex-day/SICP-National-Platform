"use client";

import React, { useState } from "react";
import { ChallengeDetail, ExpressInterestInput } from "@/features/challenges/types/challenge.types";
import { challengeService } from "@/services/challenge.service";
import { X, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpressInterestModalProps {
  challenge: ChallengeDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Omit<ExpressInterestInput, "challengeId">>({
    name: "",
    email: "",
    organization: "",
    role: "faculty",
    proposedApproach: "",
    estimatedTimelineWeeks: 12,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.organization || !formData.proposedApproach) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await challengeService.expressInterest({
        challengeId: challenge.id,
        ...formData,
      });
      setIsSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to submit interest expression.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-[#E2E8F0] rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-300 text-[#166534] flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Express Solution Interest</h3>
              <p className="text-xs text-[#64748B] truncate max-w-[320px]">
                {challenge.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 text-[#166534] flex items-center justify-center mx-auto animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#0F172A]">Interest Registered!</h4>
              <p className="text-xs text-[#475569] max-w-sm mx-auto">
                Thank you for stepping up to solve this community challenge. The district innovation coordinator and citizen submitter have been notified.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white font-semibold text-xs hover:bg-[#14532D] transition-colors cursor-pointer shadow-xs"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-[#DC2626] text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Your Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. S. Raman"
                  className="w-full rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Official Email <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="raman@iitb.ac.in"
                  className="w-full rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Institution / Organization <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="IIT Bombay / CleanTech Labs"
                  className="w-full rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Affiliation Role <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "student" | "faculty" | "industry" | "government" | "other",
                    })
                  }
                  className="w-full rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] cursor-pointer"
                >
                  <option value="faculty">Academic Faculty / PI</option>
                  <option value="student">Student Research Lead</option>
                  <option value="industry">Industry / CSR Partner</option>
                  <option value="government">Government Department</option>
                  <option value="other">Non-Profit / NGO</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Proposed Technical Approach & Scope <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formData.proposedApproach}
                onChange={(e) => setFormData({ ...formData, proposedApproach: e.target.value })}
                placeholder="Briefly describe the technology, pilot methodology, or lab prototype you intend to deploy..."
                className="w-full rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] p-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                Estimated Pilot Timeline (Weeks)
              </label>
              <input
                type="number"
                min={2}
                max={52}
                value={formData.estimatedTimelineWeeks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedTimelineWeeks: parseInt(e.target.value) || 12,
                  })
                }
                className="w-full rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-bold hover:bg-[#14532D] disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Send Proposal"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
