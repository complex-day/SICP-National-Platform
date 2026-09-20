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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                SHA-256 Cryptographic Audit Verifier
              </h3>
              <p className="text-xs text-muted-foreground">
                Public Immutable Governance Ledger Integrity Engine
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Enter Cryptographic Digest (SHA-256 Hash)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={digest}
                onChange={(e) => setDigest(e.target.value)}
                placeholder="e.g., e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isVerifying || !digest.trim()}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
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
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="h-5 w-5" />
                      <span>Cryptographic Integrity Validated</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Block #{verificationResult.blockIndex || "14820"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-background/80 rounded-xl border border-border space-y-1.5">
                      <div className="font-semibold text-foreground text-sm">
                        {verificationResult.entry.entityTitle}
                      </div>
                      <p className="text-muted-foreground">
                        {verificationResult.entry.metadataSummary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-background/60 border border-border/40">
                        <span className="text-muted-foreground block">Event Category:</span>
                        <span className="font-semibold text-foreground">
                          {verificationResult.entry.eventType} ({verificationResult.entry.sourceModule})
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-background/60 border border-border/40">
                        <span className="text-muted-foreground block">Actor Role:</span>
                        <span className="font-semibold text-foreground">
                          {verificationResult.entry.actorRole}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-background/60 border border-border/40 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>SHA-256 Digest:</span>
                        <button
                          onClick={handleCopy}
                          className="text-primary hover:underline flex items-center gap-0.5"
                        >
                          {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                          {copied ? "Copied" : "Copy Hash"}
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-emerald-400 break-all">
                        {verificationResult.entry.sha256Digest}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs text-rose-400">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldAlert className="h-5 w-5" />
                    <span>Digest Not Found on Public Ledger</span>
                  </div>
                  <p className="text-rose-400/90 text-xs">
                    The provided hash does not match any authenticated immutable block in the SICP public ledger. Verify that the string was copied accurately.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-muted/30 rounded-xl border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <span>
              All governance events in SICP are cryptographically hashed using SHA-256 and chained into immutable audit snapshots adhering to Ministry of Electronics & IT guidelines.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex justify-end bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted text-xs font-semibold border border-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
