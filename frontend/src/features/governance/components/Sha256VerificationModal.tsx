"use client";

import React, { useState, useEffect } from "react";
import { PublicAuditEntry } from "../types/governance.types";
import { governanceService } from "@/services/governance.service";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  FileCheck,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prefilledDigest?: string;
}

export function Sha256VerificationModal({
  isOpen,
  onClose,
  prefilledDigest = "",
}: Props) {
  const [digest, setDigest] = useState(prefilledDigest);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    entry: PublicAuditEntry | null;
    timestamp?: string;
    blockIndex?: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefilledDigest) {
      setDigest(prefilledDigest);
      handleVerify(prefilledDigest);
    }
  }, [prefilledDigest]);

  if (!isOpen) return null;

  const handleVerify = async (hashToVerify?: string) => {
    const target = hashToVerify || digest;
    if (!target.trim()) return;

    try {
      setIsVerifying(true);
      const res = await governanceService.verifySha256Digest(target.trim());
      setVerificationResult(res);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = () => {
    if (digest) {
      navigator.clipboard.writeText(digest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                SHA-256 Cryptographic Audit Verifier
              </h3>
              <p className="text-xs text-[#64748B]">
                Public Immutable Governance Ledger Integrity Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Enter Cryptographic Digest (SHA-256 Hash)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={digest}
                onChange={(e) => setDigest(e.target.value)}
                placeholder="e.g., e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                className="flex-1 px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs font-mono text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#166534]/20 focus:border-[#166534]"
              />
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isVerifying || !digest.trim()}
                className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs shrink-0"
              >
                {isVerifying ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                Verify Digest
              </button>
            </div>
          </div>

          {/* Verification Results Panel */}
          {verificationResult && (
            <div className="pt-2 animate-in fade-in duration-200">
              {verificationResult.isValid && verificationResult.entry ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#166534] font-bold text-sm">
                      <ShieldCheck className="h-5 w-5" />
                      <span>Cryptographic Integrity Validated</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#166534] border border-emerald-300">
                      Block #{verificationResult.blockIndex || "14820"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-1.5">
                      <div className="font-semibold text-[#0F172A] text-sm">
                        {verificationResult.entry.entityTitle}
                      </div>
                      <p className="text-[#475569]">
                        {verificationResult.entry.metadataSummary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-white border border-[#E2E8F0]">
                        <span className="text-[#64748B] block">Event Category:</span>
                        <span className="font-semibold text-[#0F172A]">
                          {verificationResult.entry.eventType} ({verificationResult.entry.sourceModule})
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-[#E2E8F0]">
                        <span className="text-[#64748B] block">Actor Role:</span>
                        <span className="font-semibold text-[#0F172A]">
                          {verificationResult.entry.actorRole}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-[#64748B]">
                        <span>SHA-256 Digest:</span>
                        <button
                          onClick={handleCopy}
                          className="text-[#166534] font-semibold hover:underline flex items-center gap-0.5"
                        >
                          {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                          {copied ? "Copied" : "Copy Hash"}
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-[#166534] break-all font-semibold">
                        {verificationResult.entry.sha256Digest}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs text-[#DC2626]">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldAlert className="h-5 w-5" />
                    <span>Digest Not Found on Public Ledger</span>
                  </div>
                  <p className="text-[#DC2626]/90 text-xs">
                    The provided hash does not match any authenticated immutable block in the SICP public ledger. Verify that the string was copied accurately.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-[#EEF2F7] rounded-lg border border-[#E2E8F0] text-[11px] text-[#475569] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#166534] shrink-0" />
            <span>
              All governance events in SICP are cryptographically hashed using SHA-256 and chained into immutable audit snapshots adhering to Ministry of Electronics & IT guidelines.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] flex justify-end bg-[#EEF2F7]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#EEF2F7] text-[#475569] hover:bg-[#E2E8F0] text-xs font-semibold border border-[#E2E8F0] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
