"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, DataTable, EmptyState } from "@/components/ui";
import { ColumnDef } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { partnershipService } from "@/services/partnership.service";
import {
  IndustryMentor,
  MentorshipSession,
  Partnership,
} from "@/features/partnership/types/partnership.types";
import {
  MentorProfileCard,
  MentorshipSessionModal,
} from "@/features/partnership/components";
import {
  Users,
  Clock,
  Building2,
  FolderGit2,
  Search,
  Sparkles,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function IndustryMentorshipHubPage() {
  const [mentors, setMentors] = useState<IndustryMentor[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("ALL");

  // Modal
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedMentorForSession, setSelectedMentorForSession] =
    useState<IndustryMentor | null>(null);
  const [selectedPartnershipForSession, setSelectedPartnershipForSession] =
    useState<Partnership | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [mentorsRes, partRes] = await Promise.all([
        partnershipService.listAllMentors(),
        partnershipService.listPartnerships(),
      ]);
      setMentors(mentorsRes);
      setPartnerships(partRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load mentorship network.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActionSuccess = (message: string) => {
    setSuccessToast(message);
    loadData();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Collect all sessions across all partnerships
  const allSessions = useMemo(() => {
    return partnerships.flatMap((p) =>
      p.sessions.map((s) => ({
        ...s,
        partnerName: p.partnerName,
        projectTitle: p.projectTitle,
      }))
    );
  }, [partnerships]);

  // Total Hours
  const totalHours = mentors.reduce((acc, m) => acc + m.totalHoursLogged, 0);

  // Filtered mentors
  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesComp = m.company.toLowerCase().includes(q);
        const matchesDesig = m.designation.toLowerCase().includes(q);
        const matchesExp = m.expertise.some((e) => e.toLowerCase().includes(q));
        if (!matchesName && !matchesComp && !matchesDesig && !matchesExp) return false;
      }

      if (selectedExpertise !== "ALL") {
        if (!m.expertise.includes(selectedExpertise)) return false;
      }

      return true;
    });
  }, [mentors, searchQuery, selectedExpertise]);

  // Unique expertise tags
  const allExpertiseTags = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((m) => m.expertise.forEach((e) => set.add(e)));
    return ["ALL", ...Array.from(set)];
  }, [mentors]);

  // Session table columns
  const sessionColumns: ColumnDef<
    MentorshipSession & { partnerName: string; projectTitle: string }
  >[] = [
    {
      key: "topic",
      header: "Session Topic & Guidance",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-semibold text-foreground text-xs">{row.topic}</div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{row.notes}</p>
        </div>
      ),
    },
    {
      key: "mentorName",
      header: "Industry Mentor",
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-foreground">{row.mentorName}</span>
          <div className="text-[10px] text-muted-foreground">{row.partnerName}</div>
        </div>
      ),
    },
    {
      key: "projectTitle",
      header: "Sponsored Project",
      sortable: true,
      render: (row) => (
        <Link
          href={`/partnerships/${row.partnershipId}`}
          className="text-xs font-medium text-primary hover:underline line-clamp-1"
        >
          {row.projectTitle}
        </Link>
      ),
    },
    {
      key: "durationHours",
      header: "Hours",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs font-bold text-foreground">
          {row.durationHours} hrs
        </div>
      ),
    },
    {
      key: "sessionDate",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.sessionDate).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      key: "actionItems",
      header: "Action Items",
      render: (row) => (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
          {row.actionItems.length} items
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading Industry Mentorship Hub & Advisory Network..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Mentorship Hub Unavailable"
          message={error}
          onRetry={loadData}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Success Toast */}
        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-medium flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
            <span>{successToast}</span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-xs uppercase font-bold tracking-wider underline hover:text-emerald-950"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="Industry Mentorship Hub"
          description="Senior corporate researchers, principal engineers, and technology leaders providing hands-on advisory to student innovation teams."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Industry Network", href: "/dashboard/industry" },
            { label: "Mentorship Hub", href: "/partnerships/mentorship" },
          ]}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2F7] text-[#166534] border border-[#E2E8F0]">
              Corporate Advisors
            </span>
          }
          actions={
            <button
              onClick={() => {
                setSelectedMentorForSession(null);
                setSelectedPartnershipForSession(partnerships[0] || null);
                setIsSessionModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] shadow-xs flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Log Advisory Session
            </button>
          }
        />

        {/* Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
              Active Industry Mentors
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {mentors.length} Advisors
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              From top R&D corporations & tech incubators
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Advisory Hours Logged
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1 flex items-baseline gap-1">
              <span>{totalHours}</span>
              <span className="text-xs font-normal text-[#64748B]">Hours</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Across {allSessions.length} technical advisory sessions
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Teams Guided
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {mentors.reduce((acc, m) => acc + m.assignedProjectsCount, 0)} Projects
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Receiving weekly engineering critiques
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Domain Expertise
            </span>
            <div className="text-2xl font-bold text-[#0F172A] mt-1">
              {allExpertiseTags.length - 1} Specializations
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Edge-AI, IoT, Bio-Sensors, Grid Solar, VLSI
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors by name, company, or domain..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
              />
            </div>
          </div>

          {/* Expertise Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {allExpertiseTags.map((exp) => (
              <button
                key={exp}
                onClick={() => setSelectedExpertise(exp)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  selectedExpertise === exp
                    ? "bg-[#166534] text-white font-semibold shadow-xs"
                    : "bg-[#EEF2F7] text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
                }`}
              >
                {exp === "ALL" ? "All Domains" : exp}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        <div>
          <h3 className="text-base font-bold text-foreground mb-4">
            Distinguished Industry Mentors ({filteredMentors.length})
          </h3>

          {filteredMentors.length === 0 ? (
            <EmptyState
              title="No Mentors Found"
              description="Try adjusting your search criteria or domain expertise filters."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMentors.map((mentor) => (
                <MentorProfileCard
                  key={mentor.id}
                  mentor={mentor}
                  onBookSession={(m) => {
                    setSelectedMentorForSession(m);
                    setSelectedPartnershipForSession(partnerships[0] || null);
                    setIsSessionModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Advisory Session History Table */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Cross-Network Mentorship Logs
              </h3>
              <p className="text-xs text-muted-foreground">
                Recorded technical guidance, architecture review minutes, and action items
              </p>
            </div>
          </div>

          <DataTable
            data={allSessions}
            columns={sessionColumns}
            searchKey="topic"
            searchPlaceholder="Filter session history..."
            pageSize={5}
          />
        </div>
      </div>

      {/* Session Modal */}
      {selectedPartnershipForSession && (
        <MentorshipSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => {
            setIsSessionModalOpen(false);
            setSelectedMentorForSession(null);
          }}
          onSuccess={handleActionSuccess}
          partnershipId={selectedPartnershipForSession.id}
          projectTitle={selectedPartnershipForSession.projectTitle}
          mentors={mentors}
          selectedMentor={selectedMentorForSession}
        />
      )}
    </DashboardLayout>
  );
}
