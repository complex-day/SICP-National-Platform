"use client";

import React, { useState } from "react";
import { FundingTranche } from "../types/partnership.types";
import { partnershipService } from "@/services/partnership.service";
import {
  X,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  tranche: FundingTranche | null;
  partnerName: string;
  projectTitle: string;
}

export function FundingReleaseModal({
  isOpen,
  onClose,
  onSuccess,
  tranche,
  partnerName,
  projectTitle,
}: Props) {
  const [disbursedBy, setDisbursedBy] = useState("Corporate CSR Bureau");
  const [notes, setNotes] = useState("");
  const [checkMilestone, setCheckMilestone] = useState(false);
  const [checkAudited, setCheckAudited] = useState(false);
  const [checkCompliance, setCheckCompliance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !tranche) return null;

  const canRelease = checkMilestone && checkAudited && checkCompliance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRelease) {
      setError("All 3 milestone-linked audit checkpoints must be validated before disbursement.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await partnershipService.releaseFundingTranche(
        tranche.partnershipId,
        tranche.id,
        disbursedBy,
        notes.trim() || undefined
      );

      const amountFormatted = `₹${(tranche.amount / 100000).toFixed(1)} Lakhs`;
      onSuccess(`Tranche #${tranche.trancheNumber} (${amountFormatted}) successfully released!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to disburse funding tranche.";
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
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Release Funding Tranche #{tranche.trancheNumber}
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                {partnerName}
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

          {/* Amount Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Disbursement Amount
              </span>
              <div className="text-2xl font-bold text-foreground mt-0.5 flex items-baseline gap-1">
                <span>₹{tranche.amount.toLocaleString("en-IN")}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({(tranche.amount / 100000).toFixed(1)} Lakhs)
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Tranche #{tranche.trancheNumber}
            </span>
          </div>

          {/* Linked Milestone info */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 text-xs">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-primary" />
              <span>Linked Milestone: {tranche.linkedMilestoneTitle}</span>
            </div>
            <p className="text-muted-foreground text-[11px] pl-5">
              <span className="font-medium text-foreground">Required Evidence: </span>
              {tranche.evidenceRequired}
            </p>
          </div>

          {/* Milestone-linked verification audit checklist */}
          <div className="space-y-2.5 pt-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Milestone Validation Checkpoints (Mandatory)
            </label>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 cursor-pointer transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={checkMilestone}
                  onChange={(e) => setCheckMilestone(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-muted-foreground leading-relaxed">
                  I confirm all technical deliverables and prototype test logs for this milestone have been vetted.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 cursor-pointer transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={checkAudited}
                  onChange={(e) => setCheckAudited(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-muted-foreground leading-relaxed">
                  Utilization Certificate (UC) for preceding advances has been submitted and verified.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 cursor-pointer transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={checkCompliance}
                  onChange={(e) => setCheckCompliance(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-muted-foreground leading-relaxed">
                  Complies with CSR Schedule VII guidelines and Institutional Finance cell terms.
                </span>
              </label>
            </div>
          </div>

          {/* Disbursed By */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              Disbursing Officer / Authority
            </label>
            <input
              type="text"
              value={disbursedBy}
              onChange={(e) => setDisbursedBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Disbursement Notes / Transaction Ref
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., RTGS Ref: HDFC00912448, approved via Steering Committee Min #4"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
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
              disabled={isSubmitting || !canRelease}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Disbursing Tranche...
                </>
              ) : (
                <>
                  <IndianRupee className="w-3.5 h-3.5" />
                  Authorize & Release Tranche
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
