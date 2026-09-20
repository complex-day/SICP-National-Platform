"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, KPICard } from "@/components/ui";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { academicService } from "@/services/academic.service";
import {
  MatchRecommendation,
  Faculty,
} from "@/features/academic/types/academic.types";
import { MatchScoreCard } from "@/features/academic/components";
import {
  Sparkles,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function AcademicMatchingPage() {
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "ACCEPTED" | "OVERRIDDEN">("ALL");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [recs, fac] = await Promise.all([
        academicService.listMatchRecommendations(),
        academicService.listFaculty(),
      ]);
      setRecommendations(recs);
      setFacultyList(fac);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load AI mentorship recommendations.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptRecommendation = async (id: string) => {
    try {
      const res = await academicService.respondMatchRecommendation(id, "ACCEPT");
      setSuccessToast(res.message);
      loadData();
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to accept recommendation.";
      setSuccessToast(msg);
    }
  };

  const handleOverrideRecommendation = async (
    id: string,
    overrideFacultyId?: string
  ) => {
    try {
      const res = await academicService.respondMatchRecommendation(
        id,
        "OVERRIDE",
        overrideFacultyId
      );
      setSuccessToast(res.message);
      loadData();
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to override recommendation.";
      setSuccessToast(msg);
    }
  };

  const filteredRecommendations = recommendations.filter((r) => {
    if (activeTab === "PENDING") return r.status === "RECOMMENDED";
    if (activeTab === "ACCEPTED") return r.status === "ACCEPTED";
    if (activeTab === "OVERRIDDEN") return r.status === "OVERRIDDEN";
    return true;
  });

  const avgScore =
    recommendations.length > 0
      ? (
          recommendations.reduce((acc, r) => acc + r.totalMatchScore, 0) /
          recommendations.length
        ).toFixed(1)
      : "0";

  const acceptedCount = recommendations.filter((r) => r.status === "ACCEPTED").length;
  const pendingCount = recommendations.filter((r) => r.status === "RECOMMENDED").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-between shadow-glow animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-emerald-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="AI Mentorship Matching Engine"
          description="Vector-semantic explainable AI recommendations matching faculty expertise, past success, capacity, and proximity to active challenges."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Academic Hub", href: "/dashboard/academic" },
            { label: "AI Matching", href: "/academic/matching" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Explainable AI (M4)
            </span>
          }
          actions={
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-glow flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Recommendations
            </button>
          }
        />

        {/* AI Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Average Match Score"
            value={`${avgScore}%`}
            subtitle="Multi-factor weighted confidence"
            icon={BrainCircuit}
            accentColor="brand"
          />
          <KPICard
            title="Pending Recommendations"
            value={pendingCount}
            subtitle="Awaiting Chair review / approval"
            icon={Sparkles}
            accentColor="amber"
          />
          <KPICard
            title="Accepted Matches"
            value={acceptedCount}
            subtitle="Successfully routed to faculty PIs"
            icon={CheckCircle2}
            accentColor="emerald"
          />
          <KPICard
            title="Scoring Criteria"
            value="5 Factors"
            subtitle="Domain, Success, Cap, Prox, Align"
            icon={Sliders}
            accentColor="blue"
          />
        </div>

        {/* 5-Factor AI Algorithm Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-background to-brand-700/15 border border-primary/20 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>Explainable AI Mentorship Vector Scoring Breakdown</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our recommendation model calculates affinity vectors based on five statutory weights:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-card/80 border border-border text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Domain Expertise</span>
              <div className="text-sm font-black font-mono text-foreground mt-0.5">30%</div>
              <span className="text-[10px] text-muted-foreground">Publications & Research</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Past Success</span>
              <div className="text-sm font-black font-mono text-foreground mt-0.5">25%</div>
              <span className="text-[10px] text-muted-foreground">Pilot Completion Track</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400">Capacity</span>
              <div className="text-sm font-black font-mono text-foreground mt-0.5">20%</div>
              <span className="text-[10px] text-muted-foreground">Workload ≤ 3 Teams</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border text-center">
              <span className="text-[10px] uppercase font-bold text-cyan-400">Proximity</span>
              <div className="text-sm font-black font-mono text-foreground mt-0.5">15%</div>
              <span className="text-[10px] text-muted-foreground">Geographic & Lab Reach</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border text-center">
              <span className="text-[10px] uppercase font-bold text-purple-400">Alignment</span>
              <div className="text-sm font-black font-mono text-foreground mt-0.5">10%</div>
              <span className="text-[10px] text-muted-foreground">Strategic R&D Focus</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ALL"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Recommendations ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "PENDING"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("ACCEPTED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "ACCEPTED"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            onClick={() => setActiveTab("OVERRIDDEN")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "OVERRIDDEN"
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overridden ({recommendations.filter((r) => r.status === "OVERRIDDEN").length})
          </button>
        </div>

        {/* Content / Recommendations List */}
        {isLoading ? (
          <LoadingState message="Executing AI match scoring algorithm across faculty datasets..." />
        ) : error ? (
          <ErrorState
            title="AI Matching Failed"
            message={error}
            onRetry={loadData}
          />
        ) : filteredRecommendations.length === 0 ? (
          <EmptyState
            title="No Recommendations in This View"
            description="All active recommendations have been processed or no matches correspond to the active filter."
            action={{
              label: "View All Recommendations",
              onClick: () => setActiveTab("ALL"),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRecommendations.map((rec) => (
              <MatchScoreCard
                key={rec.id}
                recommendation={rec}
                onAccept={handleAcceptRecommendation}
                onOverride={handleOverrideRecommendation}
                facultyList={facultyList}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
