"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader, KPICard } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import {
  Globe2,
  Users,
  Award,
  GraduationCap,
  Briefcase,
  Landmark,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return null;
  }

  const roleModules = [
    {
      title: "Citizen Problem Crowdsourcing",
      badge: "Module 2",
      role: "Citizen Portal",
      desc: "Browse geotagged citizen complaints or submit a new regional infrastructure, sanitation, or health challenge.",
      href: "/challenges",
      cta: "Explore Challenges",
      icon: Globe2,
    },
    {
      title: "Multidisciplinary Teams",
      badge: "Module 3",
      role: "Student Innovator",
      desc: "Join university engineering teams, manage skill tags (AI, IoT, CAD), and claim community problems.",
      href: "/teams",
      cta: "Teams & Roster",
      icon: Users,
    },
    {
      title: "Academic Collaboration Hub",
      badge: "Module 4",
      role: "Faculty & University",
      desc: "Review assigned university challenges, balance department workloads, and mentor student innovation cohorts.",
      href: "/dashboard/academic",
      cta: "Academic Hub",
      icon: GraduationCap,
    },
    {
      title: "Innovation Lifecycle & Milestones",
      badge: "Module 5",
      role: "Lifecycle Tracking",
      desc: "Stage-gated project workspace (Proposal, Development, Pilot, Completed) with deliverable validation.",
      href: "/projects",
      cta: "Project Registry",
      icon: Award,
    },
    {
      title: "Industry CSR Sponsorship",
      badge: "Module 6",
      role: "CSR & Industry",
      desc: "Discover vetted projects, manage milestone-linked funding tranches, and sponsor field deployments.",
      href: "/dashboard/industry",
      cta: "Industry Command",
      icon: Briefcase,
    },
    {
      title: "National Governance & Impact",
      badge: "Module 7",
      role: "Govt & Ministry",
      desc: "DIRI District Innovation Index, state geo rollups, social return on investment (SROI), and policy intelligence.",
      href: "/dashboard/government",
      cta: "Governance Intel",
      icon: Landmark,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <PageHeader
          title={`Welcome back, ${user.full_name}`}
          description={`Collaborating as ${user.role.toUpperCase()} • Trust Score: ${user.trust_score}/100 • Platform Status: Operational`}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#166534] border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
              Active Session • Verified Identity
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/citizen/create-challenge"
                className="px-3.5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Report Challenge
              </Link>
              <Link
                href="/transparency"
                className="px-3.5 py-2 rounded-lg bg-[#EEF2F7] text-[#0F172A] text-xs font-semibold hover:bg-slate-200 border border-[#E2E8F0] flex items-center gap-1.5 transition"
              >
                <Lock className="w-3.5 h-3.5 text-[#166534]" />
                Audit Ledger
              </Link>
            </div>
          }
        />

        {/* 6-Metric Command Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <KPICard
            title="Total Challenges"
            value="2,480"
            subtitle="742 Resolved (74.2%)"
            icon={Globe2}
            trend={{ value: "+18% MoM", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Active R&D Teams"
            value="612"
            subtitle="Multidisciplinary"
            icon={Users}
            trend={{ value: "+32 Teams", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Participating HEIs"
            value="148"
            subtitle="Universities & IITs"
            icon={GraduationCap}
            trend={{ value: "100% Onboarded", direction: "neutral" }}
          />
          <KPICard
            title="CSR Capital"
            value="₹11.25 Cr"
            subtitle="Milestone Tranches"
            icon={Briefcase}
            trend={{ value: "61.1% Disbursed", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Beneficiaries"
            value="1.24M"
            subtitle="Citizens Reached"
            icon={TrendingUp}
            trend={{ value: "+240k", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Audit Status"
            value="14,820"
            subtitle="SHA-256 Verified"
            icon={ShieldCheck}
            trend={{ value: "Immutable", direction: "neutral" }}
          />
        </div>

        {/* Stakeholder Command Hub (M2 - M7 Modules) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">SICP Platform Modules & Workspaces</h3>
              <p className="text-xs text-[#64748B]">
                Direct access to role-dedicated workspaces, review pipelines, and operational tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roleModules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-3 bg-white border border-[#E2E8F0] rounded-lg hover:border-[#166534]/50 hover:shadow-xs transition-all flex flex-col justify-between h-[120px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-[#0F172A] truncate">
                          {m.title}
                        </h4>
                        <span className="text-[10px] text-[#64748B]">{m.badge} • {m.role}</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-[#166534] border border-emerald-200 shrink-0">
                      Operational
                    </span>
                  </div>

                  <p className="text-[11px] text-[#475569] line-clamp-1 leading-snug">
                    {m.desc}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-[10px] text-[#64748B]">Workspace ready</span>
                    <Link
                      href={m.href}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#166534] hover:text-[#14532D]"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Quick Links & Cryptographic Integrity Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-white border border-[#E2E8F0] space-y-2.5 shadow-xs">
            <h4 className="font-bold text-xs text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#166534]" />
              Quick Actions
            </h4>
            <div className="space-y-1.5">
              <Link
                href="/citizen/create-challenge"
                className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2F7] border border-[#E2E8F0] flex items-center justify-between text-xs font-medium text-[#0F172A] transition"
              >
                <span>Report New Challenge (M2)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Link>
              <Link
                href="/teams/create"
                className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2F7] border border-[#E2E8F0] flex items-center justify-between text-xs font-medium text-[#0F172A] transition"
              >
                <span>Create Innovation Team (M3)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Link>
              <Link
                href="/projects/create"
                className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2F7] border border-[#E2E8F0] flex items-center justify-between text-xs font-medium text-[#0F172A] transition"
              >
                <span>Register R&D Project (M5)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 p-4 rounded-lg bg-white border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-[#166534] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#166534]" />
                <span>Public Cryptographic Ledger Active</span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-[#0F172A]">
                All M1–M7 events cryptographically anchored with SHA-256 block hashes
              </h4>
              <p className="text-[11px] text-[#64748B]">
                Citizen problem submissions, milestone faculty approvals, and CSR funding releases are immutably verified.
              </p>
            </div>

            <Link
              href="/transparency"
              className="px-3.5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold transition shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verify Blocks</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
