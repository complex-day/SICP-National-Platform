"use client";

import React, { useState } from "react";
import { PartnershipType, PARTNERSHIP_TYPES } from "../types/partnership.types";
import { partnershipService } from "@/services/partnership.service";
import {
  X,
  Building2,
  IndianRupee,
  Cpu,
  Mail,
  User,
  Sparkles,
  AlertCircle,
  Loader2,
  FolderGit2,
  FileText,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  defaultProject?: {
    id: string;
    title: string;
    category: string;
    teamName: string;
    institutionName: string;
  };
}

export function SponsorshipProposalModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProject,
}: Props) {
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState<
    "CORPORATE_CSR" | "MSME" | "PSU" | "STARTUP_INCUBATOR"
  >("CORPORATE_CSR");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [partnershipType, setPartnershipType] = useState<PartnershipType>("CSR_FUNDING");
  const [committedFunding, setCommittedFunding] = useState<number>(1500000);
  const [initialTranche, setInitialTranche] = useState<number>(600000);
  const [equipmentValue, setEquipmentValue] = useState<number>(0);
  const [equipmentDetails, setEquipmentDetails] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Project details fallback
  const projectId = defaultProject?.id || "proj-m5-01";
  const projectTitle =
    defaultProject?.title || "JalDrishti: Edge-AI Optical & Acoustic Water Contamination Network";
  const projectCategory = defaultProject?.category || "Water Conservation";
  const teamName = defaultProject?.teamName || "Team AquaSense";
  const institutionName = defaultProject?.institutionName || "IIT Bombay";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !contactPerson.trim() || !contactEmail.trim() || !synopsis.trim()) {
      setError("Please complete all required company and contact fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await partnershipService.createPartnership({
        partnerName: partnerName.trim(),
        partnerType,
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        projectId,
        projectTitle,
        projectCategory,
        teamName,
        institutionName,
        partnershipType,
        totalCommittedFunding: Number(committedFunding) || 0,
        initialTrancheAmount: Number(initialTranche) || undefined,
        equipmentSponsorshipValue: Number(equipmentValue) || undefined,
        equipmentDetails: equipmentDetails.trim() || undefined,
        synopsis: synopsis.trim(),
      });

      onSuccess(`CSR Sponsorship Proposal created successfully for ${partnerName}!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create sponsorship proposal.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Create CSR Sponsorship Proposal
              </h3>
              <p className="text-xs text-muted-foreground truncate max-w-[360px]">
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

          {/* Project Summary Banner */}
          <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-primary" />
              <div>
                <span className="font-semibold text-foreground">{projectTitle}</span>
                <span className="text-muted-foreground ml-2">({institutionName} • {teamName})</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
              {projectCategory}
            </span>
          </div>

          {/* Partner Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Corporate / Entity Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g., Tata Community Trust"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Entity Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={partnerType}
                onChange={(e) =>
                  setPartnerType(e.target.value as "CORPORATE_CSR" | "MSME" | "PSU" | "STARTUP_INCUBATOR")
                }
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <option value="CORPORATE_CSR">Corporate CSR Trust</option>
                <option value="PSU">Public Sector Undertaking (PSU)</option>
                <option value="MSME">MSME Enterprise</option>
                <option value="STARTUP_INCUBATOR">Corporate Incubator</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                Contact Person <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g., Rajeshwari Sen (Head of CSR)"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                Official Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g., csr.grants@partner.com"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Partnership Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Partnership & Sponsorship Mode <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PARTNERSHIP_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setPartnershipType(type)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                    partnershipType === type
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Financial & In-kind Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-500" />
                Total Committed Funding (INR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={committedFunding}
                onChange={(e) => setCommittedFunding(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-primary" />
                Tranche 1 Advance (INR)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={initialTranche}
                onChange={(e) => setInitialTranche(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          {/* Equipment / In-kind Resource Sponsorship */}
          {(partnershipType === "EQUIPMENT_SPONSORSHIP" ||
            partnershipType === "JOINT_PILOT" ||
            partnershipType === "CSR_FUNDING") && (
            <div className="p-3.5 bg-muted/20 border border-border/80 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Cpu className="h-4 w-4 text-purple-400" />
                <span>Equipment & Resource Donation (Optional)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">
                    Equipment Valued At (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="25000"
                    value={equipmentValue}
                    onChange={(e) => setEquipmentValue(Number(e.target.value))}
                    placeholder="e.g., 450000"
                    className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">
                    Donated Hardware / Cloud Credits Description
                  </label>
                  <input
                    type="text"
                    value={equipmentDetails}
                    onChange={(e) => setEquipmentDetails(e.target.value)}
                    placeholder="e.g., 20x Industrial LoRaWAN gateways & cloud testbed"
                    className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Scope & Synopsis */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Partnership Objectives & CSR Mission Alignment <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="State the strategic goals, deployment sites, target impact metrics, and alignment with corporate CSR mandate..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
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
              disabled={isSubmitting || !partnerName.trim() || !contactPerson.trim()}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Proposal...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Submit CSR Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
