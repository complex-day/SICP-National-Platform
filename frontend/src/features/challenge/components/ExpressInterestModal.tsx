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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass-panel border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Express Solution Interest</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                {challenge.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-in zoom-in">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-foreground">Interest Registered!</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Thank you for stepping up to solve this community challenge. The district innovation coordinator and citizen submitter have been notified.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. S. Raman"
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="raman@iitb.ac.in"
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Institution / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="IIT Bombay / CleanTech Labs"
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Affiliation Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "student" | "faculty" | "industry" | "government" | "other",
                    })
                  }
                  className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
              <label className="block text-xs font-semibold text-foreground mb-1">
                Proposed Technical Approach & Scope *
              </label>
              <textarea
                rows={3}
                required
                value={formData.proposedApproach}
                onChange={(e) => setFormData({ ...formData, proposedApproach: e.target.value })}
                placeholder="Briefly describe the technology, pilot methodology, or lab prototype you intend to deploy..."
                className="w-full rounded-xl bg-background border border-border p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
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
                className="w-full rounded-xl bg-background border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
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
