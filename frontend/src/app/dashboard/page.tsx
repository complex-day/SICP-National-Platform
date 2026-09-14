"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileQuestion,
  GraduationCap,
  Briefcase,
  Landmark,
  Shield,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

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

  const roleModules: Record<
    string,
    { title: string; desc: string; upcomingModule: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    citizen: {
      title: "Citizen Problem Portal",
      desc: "Report local infrastructure, water, sanitation, or health challenges with media & GPS evidence.",
      upcomingModule: "Day 2 — M2: Citizen Challenge Management",
      icon: FileQuestion,
    },
    student: {
      title: "Student Innovation Workspace",
      desc: "Join multidisciplinary problem-solving teams, work on prototypes, and earn project credits.",
      upcomingModule: "Day 4 — M4: Academic Collaboration Hub",
      icon: GraduationCap,
    },
    faculty: {
      title: "Academic Mentorship Hub",
      desc: "Review assigned societal problems, form student cohorts, and guide applied research.",
      upcomingModule: "Day 4 — M4: Academic Collaboration Hub",
      icon: GraduationCap,
    },
    industry: {
      title: "Industry Sponsorship Network",
      desc: "Discover verified university projects, allocate CSR funding, and provide industrial mentorship.",
      upcomingModule: "Day 6 — M6: Industry Partnership Network",
      icon: Briefcase,
    },
    government: {
      title: "Governance & Impact Intelligence",
      desc: "Monitor district-level problem density, track implementation status, and measure KPIs.",
      upcomingModule: "Day 7 — M7: Governance & Impact Intelligence",
      icon: Landmark,
    },
    admin: {
      title: "Platform Administration & Moderation",
      desc: "Manage platform users, oversee RBAC permissions, review audit logs, and configure AI thresholds.",
      upcomingModule: "All Modules Active (Full Super Admin Access)",
      icon: Shield,
    },
  };

  const currentRoleInfo = roleModules[role || "citizen"] || roleModules.citizen;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/30 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Authenticated IAM Session • Module 1</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome, {user.full_name}!
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Logged in as <span className="font-semibold text-white uppercase">{user.role}</span> with verified trust score of <span className="text-amber-400 font-bold">{user.trust_score}</span>.
          </p>
        </div>

        <Link
          href="/profile"
          className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 transition"
        >
          View Full Identity Profile
        </Link>
      </div>

      {/* Role Dedicated Workspace Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl">
              <RoleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentRoleInfo.title}</h2>
              <p className="text-xs text-slate-400">Personalized for {user.role} workflow</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {currentRoleInfo.desc}
          </p>

          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Next Capability Release: <strong className="text-slate-200">{currentRoleInfo.upcomingModule}</strong></span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              Scheduled
            </span>
          </div>
        </div>

        {/* Security / Session Card */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Security Overview
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Auth Token Status:</span>
              <span className="text-emerald-400 font-semibold">Active (JWT 15m)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Refresh Token:</span>
              <span className="text-slate-200 font-semibold">7 Days Valid</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">RBAC Role:</span>
              <span className="text-blue-400 font-semibold uppercase">{user.role}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Audit Logging:</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
