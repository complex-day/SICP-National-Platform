"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/ui";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { partnershipService } from "@/services/partnership.service";
import {
  Partnership,
  FundingTranche,
  IndustryMentor,
  PilotDeployment,
  AdoptionStatus,
} from "@/features/partnership/types/partnership.types";
import {
  PartnershipStatusBadge,
  TechTransferLicenseBadge,
  DeploymentStatusBadge,
  FundingCommitmentCard,
  MentorProfileCard,
  DeploymentCard,
  FundingReleaseModal,
  MentorshipSessionModal,
  PilotEvidenceModal,
} from "@/features/partnership/components";
import {
  Building2,
  GraduationCap,
  Users,
  IndianRupee,
  Clock,
  Compass,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Layers,
  Cpu,
  Award,
  BookOpen,
  Plus,
} from "lucide-react";

export default function PartnershipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [mentorsList, setMentorsList] = useState<IndustryMentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active Tab: TRANCHES | TECH_TRANSFER | MENTORSHIP | DEPLOYMENTS
  const [activeTab, setActiveTab] = useState<
    "TRANCHES" | "TECH_TRANSFER" | "MENTORSHIP" | "DEPLOYMENTS"
  >("TRANCHES");

  // Modals state
  const [selectedTrancheForRelease, setSelectedTrancheForRelease] = useState<FundingTranche | null>(
    null
  );
  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);
  const [selectedMentorForSession, setSelectedMentorForSession] = useState<IndustryMentor | null>(
    null
  );
  const [selectedDeploymentForEvidence, setSelectedDeploymentForEvidence] =
    useState<PilotDeployment | null>(null);

  const loadPartnership = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [part, mentors] = await Promise.all([
        partnershipService.getPartnershipById(id),
        partnershipService.listAllMentors(),
      ]);

      if (!part) {
        setError("Industry partnership not found.");
      } else {
        setPartnership(part);
        setMentorsList(mentors);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load partnership.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartnership();
  }, [id]);

  const handleActionSuccess = (message: string) => {
    setSuccessToast(message);
    loadPartnership();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleUpdateCRL = async (newLevel: number) => {
    if (!partnership) return;
    try {
      await partnershipService.updateTechTransfer(partnership.id, {
        commercializationReadinessLevel: newLevel,
        adoptionStatus:
          newLevel >= 8
            ? "COMMERCIAL_SCALE"
            : newLevel >= 6
            ? "PRODUCTION_READY"
            : newLevel >= 4
            ? "PILOT_VALIDATED"
            : "LAB_TEST",
      });
      handleActionSuccess(`Commercialization Readiness Level (CRL) updated to Level ${newLevel}!`);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Industry Partnership Hub..." />
      </DashboardLayout>
    );
  }

  if (error || !partnership) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Partnership Not Found"
          message={error || "The requested industry partnership workspace could not be found."}
          onRetry={loadPartnership}
        />
      </DashboardLayout>
    );
  }

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  };

  const crlDescriptions: { [key: number]: string } = {
    1: "Basic principles observed and scientific formulation.",
    2: "Technology concept and industrial application formulated.",
    3: "Analytical and experimental critical function proof of concept.",
    4: "Component validation in laboratory testbed environments.",
    5: "System prototype demonstration in relevant municipal/rural conditions.",
    6: "Full field model demonstrated in representative operational environment.",
    7: "Operational system prototype pilot tested at commercial site.",
    8: "Actual system completed and qualified through test and demonstration.",
    9: "Full commercial deployment, mass market adoption, and revenue scaling.",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-[#166534] text-sm font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-[#14532D]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Back Button */}
        <div>
          <Link
            href="/dashboard/industry"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] hover:text-[#166534] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Industry Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="gov-card p-6 rounded-xl border border-[#E2E8F0] space-y-4 bg-white shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-300">
                  {partnership.partnerType.replace(/_/g, " ")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2F7] text-[#475569] border border-[#E2E8F0]">
                  {partnership.projectCategory}
                </span>
                <PartnershipStatusBadge status={partnership.status} />
                <TechTransferLicenseBadge
                  licenseType={partnership.techTransfer.licenseType}
                  crlLevel={partnership.techTransfer.commercializationReadinessLevel}
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                {partnership.partnerName}
              </h1>

              <div className="flex items-center gap-2 text-sm text-[#64748B] mt-1">
                <span className="font-semibold text-[#0F172A]">
                  Sponsored: {partnership.projectTitle}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] mt-2">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-[#166534]" />
                  <span>{partnership.institutionName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#166534]" />
                  <span>{partnership.teamName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                  <span>
                    MoU: {new Date(partnership.mouSignedDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/projects/${partnership.projectId}`}
                className="px-3.5 py-2 rounded-lg bg-[#EEF2F7] text-[#475569] text-xs font-semibold hover:bg-[#E2E8F0] border border-[#E2E8F0] flex items-center gap-1.5 transition-colors"
              >
                <Layers className="h-3.5 w-3.5 text-[#166534]" />
                M5 Project Lifecycle
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button
                onClick={() => {
                  setSelectedMentorForSession(null);
                  setIsMentorshipModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Log Advisory Session
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/90 bg-muted/30 p-3 rounded-xl border border-border/40">
            <span className="font-semibold text-foreground">Partnership Mandate: </span>
            {partnership.synopsis}
          </p>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FundingCommitmentCard
            partnership={partnership}
            onReleaseTrancheClick={() => setActiveTab("TRANCHES")}
          />

          <div className="glass-panel p-5 rounded-xl border border-border flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Technical Mentorship
              </span>
              <div className="text-2xl font-bold text-foreground mt-2 flex items-baseline gap-2">
                <span>{partnership.mentors.length} Mentors</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({partnership.sessions.reduce((acc, s) => acc + s.durationHours, 0)} hrs logged)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Industry advisory sessions across hardware, firmware, and field pilot scaling.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("MENTORSHIP")}
              className="mt-3 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View Mentor Logs <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-border flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pilot Testbeds & Tech Transfer
              </span>
              <div className="text-2xl font-bold text-foreground mt-2 flex items-baseline gap-2">
                <span>{partnership.deployments.length} Testbeds</span>
                <span className="text-xs font-semibold text-emerald-500">
                  CRL {partnership.techTransfer.commercializationReadinessLevel}/9
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {partnership.deployments.reduce((acc, d) => acc + d.beneficiariesCount, 0).toLocaleString("en-IN")}{" "}
                total field beneficiaries reached.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("DEPLOYMENTS")}
              className="mt-3 text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1"
            >
              View Deployments <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border text-xs font-semibold gap-2 overflow-x-auto">
          {[
            {
              id: "TRANCHES" as const,
              label: "Funding Tranches & Disbursals",
              count: partnership.tranches.length,
              icon: IndianRupee,
            },
            {
              id: "TECH_TRANSFER" as const,
              label: "Technology Transfer & CRL Tracker",
              count: `CRL ${partnership.techTransfer.commercializationReadinessLevel}`,
              icon: Award,
            },
            {
              id: "MENTORSHIP" as const,
              label: "Industry Mentorship & Sessions",
              count: partnership.sessions.length,
              icon: Users,
            },
            {
              id: "DEPLOYMENTS" as const,
              label: "Pilot Testbeds & Telemetry",
              count: partnership.deployments.length,
              icon: Compass,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Funding Tranches */}
        {activeTab === "TRANCHES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Milestone-Linked Funding Tranche Schedule
                </h3>
                <p className="text-xs text-muted-foreground">
                  Disbursements are unlocked only upon verification of M5 technical milestones and utilization certificates
                </p>
              </div>
            </div>

            {partnership.tranches.length === 0 ? (
              <EmptyState
                title="No Funding Tranches Scheduled"
                description="This partnership is configured as in-kind equipment sponsorship or mentorship advisory."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnership.tranches.map((tranche) => {
                  const isReleased = tranche.status === "RELEASED";
                  const isEligible = tranche.status === "ELIGIBLE";
                  const isCommitted = tranche.status === "COMMITTED";

                  return (
                    <div
                      key={tranche.id}
                      className={`glass-panel p-5 rounded-xl border flex flex-col justify-between transition-all ${
                        isReleased
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isEligible
                          ? "border-amber-500/40 bg-amber-500/5 shadow-sm"
                          : "border-border"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground border border-border">
                            Tranche #{tranche.trancheNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isReleased
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : isEligible
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {tranche.status}
                          </span>
                        </div>

                        <div className="text-2xl font-bold text-foreground mb-1">
                          ₹{tranche.amount.toLocaleString("en-IN")}
                          <span className="text-xs font-normal text-muted-foreground ml-1.5">
                            ({(tranche.amount / 100000).toFixed(1)} Lakhs)
                          </span>
                        </div>

                        <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs mb-3">
                          <div className="font-semibold text-foreground line-clamp-1">
                            {tranche.linkedMilestoneTitle}
                          </div>
                          <p className="text-muted-foreground text-[11px] line-clamp-2">
                            <span className="font-medium text-foreground">Audit Requirement: </span>
                            {tranche.evidenceRequired}
                          </p>
                        </div>

                        {isReleased && (
                          <div className="text-[11px] text-emerald-400 font-medium space-y-0.5 mb-2">
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>
                                Released on {new Date(tranche.releaseDate || "").toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            <div className="text-muted-foreground text-[10px]">
                              Auth: {tranche.disbursedBy} {tranche.notes ? `• ${tranche.notes}` : ""}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border/70">
                        {isReleased ? (
                          <div className="w-full py-2 text-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            ✓ Disbursed & Audited
                          </div>
                        ) : isEligible ? (
                          <button
                            onClick={() => setSelectedTrancheForRelease(tranche)}
                            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Validate & Release Tranche
                          </button>
                        ) : (
                          <div className="w-full py-2 text-center text-xs text-muted-foreground bg-muted/40 rounded-lg border border-border/40">
                            Awaiting Preceding Milestones
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Technology Transfer */}
        {activeTab === "TECH_TRANSFER" && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Commercialization Readiness Level (CRL 1-9)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Standardized readiness framework for transitioning academic inventions to industrial deployment
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    Current: Level {partnership.techTransfer.commercializationReadinessLevel}
                  </span>
                </div>
              </div>

              {/* Stepper Visual */}
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                  const currentLvl = partnership.techTransfer.commercializationReadinessLevel;
                  const isPassed = lvl <= currentLvl;
                  const isCurrent = lvl === currentLvl;

                  return (
                    <button
                      key={lvl}
                      onClick={() => handleUpdateCRL(lvl)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        isCurrent
                          ? "bg-[#166534] text-white border-[#166534] shadow-xs"
                          : isPassed
                          ? "bg-emerald-50 border-emerald-300 text-[#166534] hover:bg-emerald-100"
                          : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#EEF2F7]"
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider">
                        CRL {lvl}
                      </div>
                      <div className="text-[11px] font-semibold mt-0.5 truncate">
                        {lvl <= 3 ? "Research" : lvl <= 6 ? "Prototype" : "Commercial"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active CRL explanation */}
              <div className="p-3.5 bg-[#EEF2F7] rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                <span className="font-bold text-[#0F172A]">
                  CRL Level {partnership.techTransfer.commercializationReadinessLevel} Definition:
                </span>
                <p className="text-muted-foreground">
                  {crlDescriptions[partnership.techTransfer.commercializationReadinessLevel]}
                </p>
              </div>
            </div>

            {/* Intellectual Property & Licensing Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel p-5 rounded-xl border border-border space-y-3">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <Award className="h-4 w-4 text-primary" />
                  <span>IP & Patent Portfolio</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">Patent Application No:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {partnership.techTransfer.patentApplicationNumber || "IN-2026/DEL/0049182"}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">License Modality:</span>
                    <span className="font-semibold text-primary">
                      {partnership.techTransfer.licenseType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">Royalty Sharing Clause:</span>
                    <span className="font-semibold text-foreground">
                      {partnership.techTransfer.royaltyPercentage || 4.5}% to Institution & Innovators
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-xl border border-border space-y-3">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                  <span>Commercial Scaling & Market Adoption</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">Adoption Lifecycle:</span>
                    <span className="font-semibold text-emerald-400">
                      {partnership.techTransfer.adoptionStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">Target Industry Sector:</span>
                    <span className="font-semibold text-foreground">
                      {partnership.techTransfer.targetMarket}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-muted-foreground">MoU Agreement Date:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(partnership.mouSignedDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Mentorship */}
        {activeTab === "MENTORSHIP" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Industry Mentors & Advisory Logs
                </h3>
                <p className="text-xs text-muted-foreground">
                  Senior corporate researchers and engineering leaders guiding the project team
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedMentorForSession(null);
                  setIsMentorshipModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Log Advisory Session
              </button>
            </div>

            {/* Mentors Grid */}
            {partnership.mentors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnership.mentors.map((mentor) => (
                  <MentorProfileCard
                    key={mentor.id}
                    mentor={mentor}
                    onBookSession={(m) => {
                      setSelectedMentorForSession(m);
                      setIsMentorshipModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Session Logs List */}
            <div className="gov-card p-5 rounded-xl border border-[#E2E8F0] space-y-3 bg-white shadow-xs">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#166534]" />
                <span>Advisory Session History ({partnership.sessions.length} sessions)</span>
              </h4>

              {partnership.sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No sessions logged yet. Click &quot;Log Advisory Session&quot; to add notes.
                </p>
              ) : (
                <div className="space-y-3">
                  {partnership.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-xl bg-[#EEF2F7] border border-[#E2E8F0] space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="font-semibold text-foreground text-sm">
                          {sess.topic}
                        </div>
                        <div className="flex items-center gap-2 text-[#64748B] text-[11px]">
                          <span className="font-semibold text-[#166534]">
                            {sess.mentorName}
                          </span>
                          <span>•</span>
                          <span>{sess.durationHours} hrs</span>
                          <span>•</span>
                          <span>{new Date(sess.sessionDate).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/30">
                        {sess.notes}
                      </p>

                      {sess.actionItems.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="font-semibold text-[11px] text-foreground">
                            Action Items:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {sess.actionItems.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border"
                              >
                                ✓ {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Pilot Deployments */}
        {activeTab === "DEPLOYMENTS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Field Testbeds & Pilot Deployments
                </h3>
                <p className="text-xs text-muted-foreground">
                  Live rural & municipal hardware installations, telemetry endpoints, and impact audits
                </p>
              </div>
            </div>

            {partnership.deployments.length === 0 ? (
              <EmptyState
                title="No Field Pilots Initiated"
                description="This project has not recorded active field testbed installations yet."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnership.deployments.map((dep) => (
                  <DeploymentCard
                    key={dep.id}
                    deployment={dep}
                    onUploadEvidence={(d) => setSelectedDeploymentForEvidence(d)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <FundingReleaseModal
        isOpen={Boolean(selectedTrancheForRelease)}
        onClose={() => setSelectedTrancheForRelease(null)}
        onSuccess={handleActionSuccess}
        tranche={selectedTrancheForRelease}
        partnerName={partnership.partnerName}
        projectTitle={partnership.projectTitle}
      />

      <MentorshipSessionModal
        isOpen={isMentorshipModalOpen}
        onClose={() => {
          setIsMentorshipModalOpen(false);
          setSelectedMentorForSession(null);
        }}
        onSuccess={handleActionSuccess}
        partnershipId={partnership.id}
        projectTitle={partnership.projectTitle}
        mentors={mentorsList}
        selectedMentor={selectedMentorForSession}
      />

      <PilotEvidenceModal
        isOpen={Boolean(selectedDeploymentForEvidence)}
        onClose={() => setSelectedDeploymentForEvidence(null)}
        onSuccess={handleActionSuccess}
        partnershipId={partnership.id}
        deployment={selectedDeploymentForEvidence}
      />
    </DashboardLayout>
  );
}
