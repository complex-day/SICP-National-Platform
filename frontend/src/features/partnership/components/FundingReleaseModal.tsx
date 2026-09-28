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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                Release Funding Tranche #{tranche.trancheNumber}
              </h3>
              <p className="text-xs text-[#475569] truncate max-w-[280px]">
                {partnerName}
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

          {/* Amount Card */}
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Disbursement Amount
              </span>
              <div className="text-2xl font-bold text-[#0F172A] mt-0.5 flex items-baseline gap-1 font-mono">
                <span>₹{tranche.amount.toLocaleString("en-IN")}</span>
                <span className="text-xs font-normal text-[#64748B]">
                  ({(tranche.amount / 100000).toFixed(1)} Lakhs)
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-200">
              Tranche #{tranche.trancheNumber}
            </span>
          </div>

          {/* Linked Milestone info */}
          <div className="p-3 bg-[#EEF2F7] rounded-lg border border-[#E2E8F0] space-y-1.5 text-xs">
            <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-[#166534]" />
              <span>Linked Milestone: {tranche.linkedMilestoneTitle}</span>
            </div>
            <p className="text-[#475569] text-[11px] pl-5">
              <span className="font-medium text-[#0F172A]">Required Evidence: </span>
              {tranche.evidenceRequired}
            </p>
          </div>

          {/* Milestone-linked verification audit checklist */}
          <div className="space-y-2.5 pt-1">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#166534]" />
              Milestone Validation Checkpoints (Mandatory)
            </label>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 cursor-pointer transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={checkMilestone}
                  onChange={(e) => setCheckMilestone(e.target.checked)}
                  className="mt-0.5 rounded border-[#E2E8F0] text-[#166534] focus:ring-[#166534] h-4 w-4 accent-[#166534]"
                />
                <span className="text-[#475569] leading-relaxed">
                  I confirm all technical deliverables and prototype test logs for this milestone have been vetted.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 cursor-pointer transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={checkAudited}
                  onChange={(e) => setCheckAudited(e.target.checked)}
                  className="mt-0.5 rounded border-[#E2E8F0] text-[#166534] focus:ring-[#166534] h-4 w-4 accent-[#166534]"
                />
                <span className="text-[#475569] leading-relaxed">
                  Utilization Certificate (UC) for preceding advances has been submitted and verified.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-slate-100 cursor-pointer transition-colors text-xs">
                <input
                  type="checkbox"
                  checked={checkCompliance}
                  onChange={(e) => setCheckCompliance(e.target.checked)}
                  className="mt-0.5 rounded border-[#E2E8F0] text-[#166534] focus:ring-[#166534] h-4 w-4 accent-[#166534]"
                />
                <span className="text-[#475569] leading-relaxed">
                  Complies with CSR Schedule VII guidelines and Institutional Finance cell terms.
                </span>
              </label>
            </div>
          </div>

          {/* Disbursed By */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
              <Building2 className="h-3 w-3 text-[#64748B]" />
              Disbursing Officer / Authority
            </label>
            <input
              type="text"
              value={disbursedBy}
              onChange={(e) => setDisbursedBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Disbursement Notes / Transaction Ref
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., RTGS Ref: HDFC00912448, approved via Steering Committee Min #4"
              rows={2}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] resize-none"
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
              disabled={isSubmitting || !canRelease}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 transition-all cursor-pointer"
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
