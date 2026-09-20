"use client";

import React, { useState, useEffect } from "react";
import { Department, Faculty } from "../types/academic.types";
import { academicService } from "@/services/academic.service";
import {
  X,
  Building2,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  challengeId?: string;
  challengeTitle?: string;
  category?: string;
}

export function ClaimChallengeModal({
  isOpen,
  onClose,
  onSuccess,
  challengeId = `chal-${Date.now()}`,
  challengeTitle = "Smart Rural Microgrid & Solar Storage",
  category = "Clean Energy",
}: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [proposalOverview, setProposalOverview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(true);
      Promise.all([academicService.listDepartments(), academicService.listFaculty()])
        .then(([depts, fac]) => {
          setDepartments(depts);
          setFacultyList(fac);
          if (depts.length > 0) setSelectedDeptId(depts[0].id);
          if (fac.length > 0) setSelectedFacultyId(fac[0].id);
        })
        .catch(() => {
          setError("Failed to load departments.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const filteredFaculty = selectedDeptId
    ? facultyList.filter((f) => f.departmentId === selectedDeptId)
    : facultyList;

  useEffect(() => {
    if (selectedDeptId && filteredFaculty.length > 0) {
      setSelectedFacultyId(filteredFaculty[0].id);
    }
  }, [selectedDeptId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId || !selectedFacultyId) {
      setError("Please select a Department and Lead Faculty to claim this challenge.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await academicService.claimChallenge(
        challengeId,
        challengeTitle,
        category,
        selectedDeptId,
        selectedFacultyId
      );
      onSuccess(`Successfully claimed "${challengeTitle}" for academic R&D deployment!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to claim challenge.";
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
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Claim University Challenge Intake
              </h3>
              <p className="text-xs text-muted-foreground">
                HEI Institutional Challenge Adoption
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Challenge summary */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Selected Challenge
            </span>
            <h4 className="font-semibold text-foreground text-sm">
              {challengeTitle}
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium">
                {category}
              </span>
              <span className="text-muted-foreground text-[11px]">
                Open for HEI Adoption
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-6 border border-border rounded-xl text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-primary" />
              Loading institutional departments...
            </div>
          ) : (
            <>
              {/* Department */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Select Claiming Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  required
                >
                  <option value="" disabled>
                    -- Choose Department --
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.universityName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Faculty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  Appoint Lead Principal Investigator (PI)
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                  required
                >
                  <option value="" disabled>
                    -- Choose Lead Faculty --
                  </option>
                  {filteredFaculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation}) - Active Mentorships: {f.activeMentorshipCount}/3
                    </option>
                  ))}
                </select>
              </div>

              {/* Proposal Overview */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Institutional Adoption Justification / R&D Scope
                </label>
                <textarea
                  value={proposalOverview}
                  onChange={(e) => setProposalOverview(e.target.value)}
                  placeholder="Outline lab capability, student capstone intake, and expected prototype delivery timeline..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
                />
              </div>
            </>
          )}

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
              disabled={isSubmitting || isLoading || !selectedDeptId || !selectedFacultyId}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Claiming Challenge...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Claim Challenge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
