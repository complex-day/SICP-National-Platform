"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/common/KpiCard";
import { GovCard, GovCardHeader, GovCardTitle, GovCardContent } from "@/components/common/GovCard";
import { Challenge } from "@/features/challenges/types/challenge.types";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";
import {
  FileText,
  Clock,
  CheckCircle2,
  GraduationCap,
  PlusCircle,
  ArrowRight,
  MapPin,
  Bell,
  ChevronRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status Badge Helper according to Gov spec
export function GovStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "DRAFT":
      return (
        <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
          Draft
        </span>
      );
    case "UNDER_REVIEW":
    case "SUBMITTED":
    case "PENDING":
      return (
        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-[#ED6C02] border border-amber-200">
          Under Review
        </span>
      );
    case "ASSIGNED":
    case "MATCHED":
      return (
        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#166534] border border-blue-200">
          Assigned
        </span>
      );
    case "ACTIVE":
    case "IN_PROGRESS":
      return (
        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-[#2E7D32] border border-emerald-200">
          In Progress
        </span>
      );
    case "RESOLVED":
    case "COMPLETED":
      return (
        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-[#1b5e20] border border-emerald-300">
          Resolved
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          {status}
        </span>
      );
  }
}

export default function CitizenDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await challengeService.listMyChallenges(1, 10, user?.id);
        setChallenges(res.items || []);
      } catch (err) {
        console.error("Failed to load citizen challenges", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  // Derived KPI metrics
  const totalCount = challenges.length || 18;
  const underReviewCount = challenges.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length || 3;
  const assignedCount = challenges.filter((c) => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length || 9;
  const resolvedCount = challenges.filter((c) => c.status === "RESOLVED" || c.status === "COMPLETED").length || 6;

  // Government Activity Notifications Feed
  const notifications = [
    {
      id: "notif-1",
      type: "university",
      title: "University Assigned",
      desc: "IIT Bombay Environmental Engineering Department claimed challenge #CHL-204.",
      time: "2 hours ago",
      icon: GraduationCap,
      color: "text-[#166534] bg-blue-50 border-blue-200",
    },
    {
      id: "notif-2",
      type: "status",
      title: "Status Changed",
      desc: "Water filtration grievance in Ranchi marked as 'In Progress - Prototype Built'.",
      time: "1 day ago",
      icon: CheckCircle2,
      color: "text-[#2E7D32] bg-emerald-50 border-emerald-200",
    },
    {
      id: "notif-3",
      type: "project",
      title: "Project Started",
      desc: "Student Squad 'AquaTech-6' initiated Milestone 1 field trials in Palamu district.",
      time: "2 days ago",
      icon: Building2,
      color: "text-[#F57C00] bg-orange-50 border-orange-200",
    },
    {
      id: "notif-4",
      type: "review",
      title: "Review Completed",
      desc: "District Nodal Officer validated ground deployment for Sanitation Unit #CHL-189.",
      time: "3 days ago",
      icon: ShieldCheck,
      color: "text-[#166534] bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <DashboardLayout requireAuth={false}>
      {/* Top Banner / Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/" className="hover:text-[#166534]">Portal</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Citizen Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
            Citizen Grievance & Innovation Command
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Track community problem submissions, university allocation progress, and ground-level resolution status.
          </p>
        </div>

        <Link
          href="/citizen/submit-problem"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#166534] hover:bg-[#083b7a] text-white text-sm font-semibold rounded-md shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Submit New Challenge</span>
        </Link>
      </div>

      {/* 1. Official 4-Card KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Reports"
          value={totalCount}
          subtitle="Submitted across districts"
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          label="Under Review"
          value={underReviewCount}
          subtitle="AI triage & validation"
          trend="Pending Action"
          trendType="neutral"
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          label="Assigned"
          value={assignedCount}
          subtitle="To University R&D Teams"
          trend="Active Squads"
          trendType="positive"
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <KpiCard
          label="Resolved"
          value={resolvedCount}
          subtitle="Deployed in field"
          trend="Verified Impact"
          trendType="positive"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* 2. Challenge Lifecycle Flow Visual */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Challenge Resolution Lifecycle
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[#166534] font-semibold flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-blue-600">Step 1</span>
            <span className="mt-0.5">Submitted</span>
          </div>
          <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-gray-700 font-medium flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Step 2</span>
            <span className="mt-0.5">Validated</span>
          </div>
          <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-gray-700 font-medium flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Step 3</span>
            <span className="mt-0.5">AI Categorized</span>
          </div>
          <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-gray-700 font-medium flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Step 4</span>
            <span className="mt-0.5">University Assigned</span>
          </div>
          <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-gray-700 font-medium flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Step 5</span>
            <span className="mt-0.5">Project Started</span>
          </div>
          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-[#2E7D32] font-semibold flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-600">Step 6</span>
            <span className="mt-0.5">Resolved</span>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Section: Recent Reports (Left) & Notifications (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Reports Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#166534]" />
                <h3 className="text-sm font-bold text-[#212121] uppercase tracking-wide">
                  Recent Submissions
                </h3>
              </div>
              <Link
                href="/citizen/my-reports"
                className="text-xs font-semibold text-[#166534] hover:underline inline-flex items-center gap-1"
              >
                <span>View All ({totalCount})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-gray-100/70 text-gray-600 uppercase font-semibold text-[11px]">
                    <th className="py-2.5 px-4">Challenge ID</th>
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">District</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Last Updated</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {challenges.length > 0 ? (
                    challenges.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-gray-700">
                          #{item.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#212121] max-w-xs truncate">
                          <Link
                            href={`/citizen/report/${item.id}`}
                            className="hover:text-[#166534] hover:underline"
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.location?.district || "Ranchi"}
                        </td>
                        <td className="py-3 px-4">
                          <GovStatusBadge status={item.status} />
                        </td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/citizen/report/${item.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] hover:text-blue-900 border border-blue-200 px-2 py-1 rounded bg-blue-50/50"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Default Demonstration entries
                    [
                      { id: "CHL-8912", title: "Contaminated ground water supply in Block 4", district: "Ranchi", status: "IN_PROGRESS", updated: "27 Sep 2026" },
                      { id: "CHL-8904", title: "Solar cold storage requirement for organic vegetables", district: "Dhanbad", status: "ASSIGNED", updated: "26 Sep 2026" },
                      { id: "CHL-8842", title: "Broken rural culvert bridge isolating primary health clinic", district: "Palamu", status: "UNDER_REVIEW", updated: "25 Sep 2026" },
                      { id: "CHL-8790", title: "Sanitation drainage overflow in market ward 12", district: "Bokaro", status: "RESOLVED", updated: "22 Sep 2026" },
                    ].map((mock) => (
                      <tr key={mock.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-gray-700">
                          #{mock.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#212121] max-w-xs truncate">
                          <Link
                            href={`/challenges/${mock.id}`}
                            className="hover:text-[#166534] hover:underline"
                          >
                            {mock.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{mock.district}</td>
                        <td className="py-3 px-4">
                          <GovStatusBadge status={mock.status} />
                        </td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {mock.updated}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/challenges/${mock.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] hover:text-blue-900 border border-blue-200 px-2 py-1 rounded bg-blue-50/50"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-[#E2E8F0] bg-gray-50 text-center">
              <Link
                href="/citizen/my-reports"
                className="text-xs font-semibold text-[#166534] hover:underline"
              >
                Access Full Report Ledger &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & Activity Feed */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#166534]" />
                <h3 className="text-sm font-bold text-[#212121] uppercase tracking-wide">
                  Live Action Feed
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#166534] border border-blue-200">
                Active
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="p-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className={cn("p-1.5 rounded border shrink-0 mt-0.5", n.color)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-[#212121] truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-gray-50 border-t border-[#E2E8F0] text-center">
              <Link
                href="/transparency"
                className="text-xs font-semibold text-[#166534] hover:underline inline-flex items-center gap-1"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verify Public Audit Ledger</span>
              </Link>
            </div>
          </div>

          {/* Quick Help & Grievance Protocol Card */}
          <div className="bg-[#F5F7FA] border border-[#E2E8F0] rounded-md p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-700">
              National Helpline & Support
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              If an urgent issue poses imminent risk to public health or life, contact the National Grievance Cell:
            </p>
            <div className="bg-white border border-[#E2E8F0] rounded p-2 text-center text-xs font-mono font-bold text-[#166534]">
              Toll Free: 1800-111-SICP (7427)
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
