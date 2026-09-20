"use client";

import React, { useState } from "react";
import { MatchRecommendation, Faculty } from "../types/academic.types";
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Building2,
  GraduationCap,
  TrendingUp,
  BrainCircuit,
  Sliders,
  Check,
  X,
  Loader2,
} from "lucide-react";

interface Props {
  recommendation: MatchRecommendation;
  onAccept: (id: string) => Promise<void>;
  onOverride: (id: string, overrideFacultyId?: string) => Promise<void>;
  facultyList?: Faculty[];
}

export function MatchScoreCard({
  recommendation,
  onAccept,
  onOverride,
  facultyList = [],
}: Props) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideFacultyId, setOverrideFacultyId] = useState("");

  const { breakdown } = recommendation;

  // Breakdown percentages calculation:
  // domainExpertise: max 30
  // pastSuccess: max 25
  // capacity: max 20
  // proximity: max 15
  // alignment: max 10

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await onAccept(recommendation.id);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideFacultyId) return;
    try {
      setIsOverriding(true);
      await onOverride(recommendation.id, overrideFacultyId);
      setShowOverrideModal(false);
    } finally {
      setIsOverriding(false);
    }
  };

  const getStatusBadge = () => {
    switch (recommendation.status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </span>
        );
      case "OVERRIDDEN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sliders className="w-3.5 h-3.5" />
            Chair Overridden
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <X className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI Recommended
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 shadow-sm flex flex-col justify-between relative overflow-hidden group">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                {recommendation.challengeCategory}
              </span>
              {getStatusBadge()}
            </div>
            <h3 className="font-bold text-base text-foreground tracking-tight leading-snug">
              {recommendation.challengeTitle}
            </h3>
          </div>

          {/* AI Match Score Badge */}
          <div className="flex flex-col items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-br from-primary/15 via-background to-brand-700/20 border border-primary/30 shrink-0 text-center">
            <div className="flex items-center gap-1 text-primary font-black text-2xl font-mono">
              <span>{recommendation.totalMatchScore}%</span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Match Score
            </span>
          </div>
        </div>

        {/* Recommended Faculty Card */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">
                {recommendation.facultyName}
              </h4>
              <p className="text-xs text-muted-foreground">
                {recommendation.facultyDepartment} · {recommendation.facultyInstitution}
              </p>
            </div>
          </div>
        </div>

        {/* Explainable Factor Breakdown */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" />
              Explainable Match Factors
            </h4>
            <span className="text-[10px] font-medium text-muted-foreground">
              Weighted AI Vector Multi-Criteria
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* 1. Domain Expertise (30%) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground font-medium">
                  Domain Expertise (30% Max)
                </span>
                <span className="font-semibold font-mono text-foreground">
                  {breakdown.domainExpertise} / 30 pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.domainExpertise / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. Past Success (25%) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground font-medium">
                  Past Success & R&D Track (25% Max)
                </span>
                <span className="font-semibold font-mono text-foreground">
                  {breakdown.pastSuccess} / 25 pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.pastSuccess / 25) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. Capacity (20%) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground font-medium">
                  Mentorship Capacity (20% Max)
                </span>
                <span className="font-semibold font-mono text-foreground">
                  {breakdown.capacity} / 20 pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.capacity / 20) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. Proximity (15%) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground font-medium">
                  Geographic & Lab Proximity (15% Max)
                </span>
                <span className="font-semibold font-mono text-foreground">
                  {breakdown.proximity} / 15 pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.proximity / 15) * 100}%` }}
                />
              </div>
            </div>

            {/* 5. Alignment (10%) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground font-medium">
                  Strategic Problem Alignment (10% Max)
                </span>
                <span className="font-semibold font-mono text-foreground">
                  {breakdown.alignment} / 10 pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(breakdown.alignment / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Explainable Reasoning */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground/90 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Rationale:
          </span>
          <p className="italic leading-relaxed">{recommendation.reasoning}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-5 border-t border-border mt-5 flex items-center justify-between gap-3">
        <button
          onClick={() => setShowOverrideModal(true)}
          disabled={recommendation.status === "ACCEPTED" || isAccepting || isOverriding}
          className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
        >
          <Sliders className="w-3.5 h-3.5" />
          Override Recommendation
        </button>

        <button
          onClick={handleAccept}
          disabled={recommendation.status === "ACCEPTED" || isAccepting || isOverriding}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
        >
          {isAccepting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Accepting...
            </>
          ) : recommendation.status === "ACCEPTED" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              Accepted
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accept Recommendation
            </>
          )}
        </button>
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                Override Faculty Recommendation
              </h4>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                As Academic Chair, select an alternate qualified faculty mentor for{" "}
                <span className="font-semibold text-foreground">
                  "{recommendation.challengeTitle}"
                </span>
                .
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Select Alternate Faculty Mentor
                </label>
                <select
                  value={overrideFacultyId}
                  onChange={(e) => setOverrideFacultyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  required
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {facultyList
                    .filter((f) => f.id !== recommendation.facultyId)
                    .map((f) => (
                      <option
                        key={f.id}
                        value={f.id}
                        disabled={f.activeMentorshipCount >= 3}
                      >
                        {f.name} ({f.departmentName}) [{f.activeMentorshipCount}/3 Mentorships]
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!overrideFacultyId || isOverriding}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isOverriding ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Overriding...
                    </>
                  ) : (
                    "Confirm Override"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
