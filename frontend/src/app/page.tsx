"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Users,
  GraduationCap,
  Briefcase,
  Landmark,
  ShieldCheck,
  ArrowRight,
  User,
  Lightbulb,
  Award,
  CheckCircle2,
  ChevronRight,
  Lock,
  IndianRupee,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Building2,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const stats = [
    { label: "Civic Challenges Logged", value: "2,480+", subtext: "+18% this month", icon: Globe2 },
    { label: "Active Student Teams", value: "612", subtext: "Cross-disciplinary", icon: Users },
    { label: "Participating HEIs", value: "148", subtext: "Universities & IITs", icon: GraduationCap },
    { label: "CSR Capital Committed", value: "₹11.25 Cr", subtext: "Milestone-linked", icon: IndianRupee },
    { label: "Citizens Impacted", value: "1.24M", subtext: "Direct beneficiaries", icon: Building2 },
    { label: "Verified Audit Blocks", value: "14,820", subtext: "SHA-256 immutable", icon: ShieldCheck },
  ];

  const problemFlow = [
    {
      step: "01",
      title: "Citizen",
      desc: "Local community challenges crowdsourced with geotagged photo evidence and priority rating.",
      badge: "Intake",
    },
    {
      step: "02",
      title: "Challenge Validation",
      desc: "AI semantic classification, duplicate detection, and verification of local relevance.",
      badge: "AI Filter",
    },
    {
      step: "03",
      title: "University Assignment",
      desc: "Automated routing to matching Higher Education Institutions and academic departments.",
      badge: "Allocation",
    },
    {
      step: "04",
      title: "Student Team Formation",
      desc: "Cross-disciplinary student squads (AI/ML, IoT, Embedded, CAD, UI/UX) claim problems.",
      badge: "R&D Squads",
    },
    {
      step: "05",
      title: "Industry Mentorship",
      desc: "Corporate sponsors provide technical guidance and milestone-gated CSR grant funding.",
      badge: "CSR Tranches",
    },
    {
      step: "06",
      title: "Pilot Deployment",
      desc: "Field testing and real-world implementation in target rural and urban districts.",
      badge: "Field Trials",
    },
    {
      step: "07",
      title: "Social Impact",
      desc: "DIRI District Innovation Index evaluation, verified SROI, and permanent public ledger audit.",
      badge: "Transformation",
    },
  ];

  const compactModules = [
    {
      title: "Citizen Problem Crowdsourcing",
      badge: "Module 2",
      role: "Citizens & Communities",
      desc: "Submit geotagged civic challenges across water, sanitation, infrastructure, and healthcare with resolution tracking.",
      href: "/challenges",
      icon: User,
    },
    {
      title: "Student Innovation Teams",
      badge: "Module 3",
      role: "Student Innovators",
      desc: "Form multidisciplinary squads, manage engineering skill tags, and collaborate on validated societal problems.",
      href: "/teams",
      icon: Users,
    },
    {
      title: "Academic Collaboration Hub",
      badge: "Module 4",
      role: "Faculty & Universities",
      desc: "Department workload balancing, challenge review pipelines, faculty mentorship, and academic credit scoring.",
      href: "/dashboard/academic",
      icon: GraduationCap,
    },
    {
      title: "Stage-Gated Project Lifecycle",
      badge: "Module 5",
      role: "Project Execution",
      desc: "Four-phase milestone governance (Proposal → Development → Pilot → Completed) with deliverable validation.",
      href: "/projects",
      icon: Award,
    },
    {
      title: "Industry CSR Sponsorship",
      badge: "Module 6",
      role: "Corporate Sponsors",
      desc: "Direct CSR grant capital to verified university prototypes with automated milestone-linked tranche disbursements.",
      href: "/dashboard/industry",
      icon: Briefcase,
    },
    {
      title: "National Governance Command",
      badge: "Module 7",
      role: "Government & Ministries",
      desc: "District Innovation & Resolution Index (DIRI), state rollups, SROI auditing, and policy decision intelligence.",
      href: "/dashboard/government",
      icon: Landmark,
    },
  ];

  const stakeholders = [
    {
      name: "Citizens",
      role: "Problem Identifiers",
      desc: "First responders on the ground who identify infrastructure, water, sanitation, and civic bottlenecks.",
      features: ["Mobile geotagged intake", "Real-time resolution status", "Public grievance ledger"],
    },
    {
      name: "Universities & HEIs",
      role: "Academic Centers",
      desc: "Higher education institutions providing research labs, faculty supervision, and innovation infrastructure.",
      features: ["Department matching", "Curriculum credit alignment", "Multi-institution consortiums"],
    },
    {
      name: "Faculty Mentors",
      role: "Technical Evaluators",
      desc: "Domain experts guiding student engineering squads through stage-gated milestone reviews.",
      features: ["Milestone sign-off", "Deliverable scoring", "Workload management"],
    },
    {
      name: "Industry & Startups",
      role: "CSR & Technical Partners",
      desc: "Corporate entities providing domain mentorship, testbed access, and milestone-linked CSR capital.",
      features: ["Tranche disbursements", "Direct student hiring pipeline", "IP & patent support"],
    },
    {
      name: "Government",
      role: "Policy & Administrative Oversight",
      desc: "District collectors, state departments, and central ministries monitoring societal impact and scaling solutions.",
      features: ["DIRI District Index", "SROI analytical models", "SHA-256 audit transparency"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Official Tri-Color National Portal Bar */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* Top Gov Header */}
      <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-4 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">भारत सरकार | Government of India</span>
            <span className="text-slate-300">|</span>
            <span className="hidden sm:inline">Ministry of Education & AICTE Initiative</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="font-medium text-blue-700">SIH Problem Statement ID: 26043</span>
            <span className="hidden md:inline text-slate-500">Standard Light Theme</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              🏛️
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">SICP</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  GovTech Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline leading-none mt-0.5">
                Societal Innovation Collaboration Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-700">
            <Link href="/challenges" className="hover:text-blue-700 transition-colors">Civic Challenges</Link>
            <Link href="/teams" className="hover:text-blue-700 transition-colors">Teams & Roster</Link>
            <Link href="/projects" className="hover:text-blue-700 transition-colors">Projects Registry</Link>
            <Link href="/partnerships" className="hover:text-blue-700 transition-colors">CSR Marketplace</Link>
            <Link href="/transparency" className="hover:text-blue-700 transition-colors flex items-center gap-1 text-slate-700">
              <Lock className="w-3 h-3 text-blue-600" /> Public Transparency
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/citizen/create-challenge"
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1"
                >
                  <span>Submit Challenge</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 shadow-md">
            <div className="flex flex-col space-y-2 text-sm font-medium">
              <Link
                href="/challenges"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100 text-slate-800"
              >
                Civic Challenges
              </Link>
              <Link
                href="/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100 text-slate-800"
              >
                Teams & Roster
              </Link>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100 text-slate-800"
              >
                Projects Registry
              </Link>
              <Link
                href="/partnerships"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100 text-slate-800"
              >
                CSR Marketplace
              </Link>
              <Link
                href="/transparency"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100 text-slate-800 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Public Transparency
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700"
              >
                Sign In
              </Link>
              <Link
                href="/citizen/create-challenge"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-blue-700 text-white"
              >
                Submit Challenge
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Government of India Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-5">
            <span>National Innovation Framework • SIH 26043</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Societal Innovation Collaboration Portal
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Crowdsourcing Community Challenges through Universities and Industry Partnerships
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
            A structured national platform connecting Citizens, Higher Education Institutions (HEIs), Student Innovators,
            Corporate CSR Grantors, and Government Ministries.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/citizen/create-challenge"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-xs transition flex items-center gap-2"
            >
              <span>Submit Challenge</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/challenges"
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 shadow-xs transition"
            >
              Explore Challenges
            </Link>
            <Link
              href="/transparency"
              className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Public Audit Ledger</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Flow Diagram */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Operational Methodology</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              End-to-End Problem Resolution Flow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              The 7-stage lifecycle transforming grassroots civic issues into deployed societal solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {problemFlow.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {step.step}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-snug">{step.desc}</p>
                </div>
                {idx < problemFlow.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    ➔
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Metrics</span>
            <h3 className="text-lg font-bold text-slate-900">Platform Statistics & Transparency</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-left">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-600 truncate">{s.label}</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.subtext}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stakeholders Workspaces (Compact Tiles) */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Workspaces & Functional Modules</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Stakeholder Command Workspaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Dedicated lightweight interfaces with full operational workflows for each participant role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {compactModules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-xs transition-all flex flex-col justify-between h-[124px]"
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
                      Active
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1 leading-snug">
                    {m.desc}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">GovTech Module</span>
                    <Link
                      href={m.href}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900"
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
      </section>

      {/* Stakeholders Overview Grid */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Ecosystem Roles</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Platform Stakeholders</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Aligned collaboration between civil society, academia, corporate CSR, and public administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {stakeholders.map((s, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{s.name}</div>
                  <div className="text-[11px] font-medium text-blue-700 mb-2">{s.role}</div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">{s.desc}</p>
                </div>
                <div className="space-y-1.5 pt-3 border-t border-slate-200">
                  {s.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official GovTech Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-300 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            <div className="space-y-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏛️</span>
                <span className="font-bold text-white text-sm">SICP National Portal</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Societal Innovation Collaboration Portal. Built for Smart India Hackathon (SIH 26043)
                to crowdsource community challenges and power university-industry problem solving.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Key Portals</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/challenges" className="hover:text-white transition">Civic Challenges</Link></li>
                <li><Link href="/teams" className="hover:text-white transition">Student Innovation Teams</Link></li>
                <li><Link href="/projects" className="hover:text-white transition">Project Milestones Registry</Link></li>
                <li><Link href="/partnerships" className="hover:text-white transition">CSR Marketplace</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Governance</div>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/dashboard/government" className="hover:text-white transition">DIRI District Analytics</Link></li>
                <li><Link href="/transparency" className="hover:text-white transition">SHA-256 Public Audit Ledger</Link></li>
                <li><Link href="/dashboard/academic" className="hover:text-white transition">University Workload Command</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Role Login Gateway</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Compliance & Standards</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Compliant with Guidelines for Indian Government Websites (GIGW) & Digital India design standards.
              </p>
              <div className="pt-2 text-[11px] text-slate-400">
                State of Jharkhand • Ministry of Education • AICTE
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2026 SICP Platform • National Societal Innovation Operating System. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/transparency" className="hover:text-white transition">Ledger Audit</Link>
              <Link href="/login" className="hover:text-white transition">Admin Portal</Link>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Problem Statement 26043</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
