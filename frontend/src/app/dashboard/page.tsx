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
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400",
    },
    {
      title: "Multidisciplinary Teams",
      badge: "Module 3",
      role: "Student Innovator",
      desc: "Join university engineering teams, manage skill tags (AI, IoT, CAD), and claim community problems.",
      href: "/teams",
      cta: "Teams & Roster",
      icon: Users,
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400",
    },
    {
      title: "Academic Collaboration Hub",
      badge: "Module 4",
      role: "Faculty & University",
      desc: "Review assigned university challenges, balance department workloads, and mentor student innovation cohorts.",
      href: "/dashboard/academic",
      cta: "Academic Hub",
      icon: GraduationCap,
      color: "from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-400",
    },
    {
      title: "Innovation Lifecycle & Milestones",
      badge: "Module 5",
      role: "Lifecycle Tracking",
      desc: "Stage-gated project workspace (Proposal, Development, Pilot, Completed) with deliverable validation.",
      href: "/projects",
      cta: "Project Registry",
      icon: Award,
      color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20 text-indigo-400",
    },
    {
      title: "Industry CSR Sponsorship",
      badge: "Module 6",
      role: "CSR & Industry",
      desc: "Discover vetted projects, manage milestone-linked funding tranches, and sponsor field deployments.",
      href: "/dashboard/industry",
      cta: "Industry Command",
      icon: Briefcase,
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400",
    },
    {
      title: "National Governance & Impact",
      badge: "Module 7",
      role: "Govt & Ministry",
      desc: "DIRI District Innovation Index, state geo rollups, social return on investment (SROI), and policy intelligence.",
      href: "/dashboard/government",
      cta: "Governance Intel",
      icon: Landmark,
      color: "from-cyan-500/10 to-sky-500/10 border-cyan-500/20 text-cyan-400",
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Session • Verified Identity
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/citizen/create-challenge"
                className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Report Challenge
              </Link>
              <Link
                href="/transparency"
                className="px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-muted border border-border flex items-center gap-1.5 transition"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
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
            accentColor="brand"
            trend={{ value: "+18% MoM", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Active R&D Teams"
            value="612"
            subtitle="Multidisciplinary"
            icon={Users}
            accentColor="emerald"
            trend={{ value: "+32 Teams", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Participating HEIs"
            value="148"
            subtitle="Universities & IITs"
            icon={GraduationCap}
            accentColor="purple"
            trend={{ value: "100% Onboarded", direction: "neutral" }}
          />
          <KPICard
            title="CSR Capital"
            value="₹11.25 Cr"
            subtitle="Milestone Tranches"
            icon={Briefcase}
            accentColor="amber"
            trend={{ value: "61.1% Disbursed", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Beneficiaries"
            value="1.24M"
            subtitle="Citizens Reached"
            icon={TrendingUp}
            accentColor="blue"
            trend={{ value: "+240k", direction: "up", isPositive: true }}
          />
          <KPICard
            title="Audit Status"
            value="14,820"
            subtitle="SHA-256 Verified"
            icon={ShieldCheck}
            accentColor="emerald"
            trend={{ value: "Immutable", direction: "neutral" }}
          />
        </div>

        {/* Stakeholder Command Hub (M2 - M7 Modules) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">SICP Platform Modules & Workspaces</h3>
              <p className="text-xs text-slate-500">
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
                  className="p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-xs transition-all flex flex-col justify-between h-[120px]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-slate-900 truncate">
                          {m.title}
                        </h4>
                        <span className="text-[10px] text-slate-500">{m.badge} • {m.role}</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Operational
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1 leading-snug">
                    {m.desc}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">Workspace ready</span>
                    <Link
                      href={m.href}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800"
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
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2.5 shadow-xs">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Quick Actions
            </h4>
            <div className="space-y-1.5">
              <Link
                href="/citizen/create-challenge"
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-medium text-slate-800 transition"
              >
                <span>Report New Challenge (M2)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/teams/create"
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-medium text-slate-800 transition"
              >
                <span>Create Innovation Team (M3)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/projects/create"
                className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-medium text-slate-800 transition"
              >
                <span>Register R&D Project (M5)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 p-4 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Public Cryptographic Ledger Active</span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                All M1–M7 events cryptographically anchored with SHA-256 block hashes
              </h4>
              <p className="text-[11px] text-slate-500">
                Citizen problem submissions, milestone faculty approvals, and CSR funding releases are immutably verified.
              </p>
            </div>

            <Link
              href="/transparency"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shrink-0 flex items-center gap-1.5 shadow-xs"
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
