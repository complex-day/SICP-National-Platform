"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  User,
  Award,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  FileText,
  Building2,
  MapPin,
  ExternalLink,
  Layers,
  ChevronLeft,
  Bell,
  Cpu,
  Sparkles,
  Download,
  Info,
  Radio,
  Server,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "JHARKHAND STATE SOCIETAL INNOVATION & RESEARCH NETWORK",
      subtitle: "Connecting Grassroots Citizen Challenges with Academic R&D, JAP-IT, and CSR Grants for Sustainable Development",
      tagline: "State Societal Innovation Mission • Dept. of Higher & Technical Education / Dept. of IT & e-Governance, Govt. of Jharkhand",
    },
    {
      title: "JHARNET & REGIONAL TELEMETRY NETWORK",
      subtitle: "Decentralized Environmental Monitoring, Clean Water Diagnostics & Smart Agriculture across 24 Districts",
      tagline: "Empowering 24 Districts of Jharkhand with Real-Time Geospatial Intelligence (JSAC / PM GatiShakti)",
    },
    {
      title: "JHARKHAND ACADEMIC CAPSTONE & DEEP-TECH INITIATIVE",
      subtitle: "48+ Accredited Higher Education Institutions (BIT Mesra, IIT ISM Dhanbad, NIT Jamshedpur, JUT)",
      tagline: "JUT / AICTE Aligned Capstone Credit Allocation & Field Verification",
    },
  ];

  const nationalStats = [
    { label: "Community Challenges", value: "2,480+", subtext: "From 24 Districts of Jharkhand", icon: Globe },
    { label: "Partner Universities", value: "48+", subtext: "BIT Mesra, IIT ISM, NIT, JUT", icon: GraduationCap },
    { label: "Active Student Squads", value: "612", subtext: "Multidisciplinary R&D", icon: Users },
    { label: "CSR Capital Committed", value: "₹11.25 Cr", subtext: "Milestone-Gated Tranches", icon: IndianRupee },
    { label: "Citizens Impacted", value: "1.24 Million", subtext: "Verified Ground Relief", icon: Building2 },
    { label: "Immutable Audit Blocks", value: "14,820", subtext: "SHA-256 Public Ledger", icon: ShieldCheck },
  ];

  const leadership = [
    {
      role: "Hon'ble Chief Minister",
      name: "Shri Hemant Soren",
      dept: "Government of Jharkhand / Patron, State Innovation Mission",
      image: "/images/leadership/hemant_soren.png",
      initial: "HS",
    },
    {
      role: "Principal Secretary, IAS",
      name: "Shri Rahul Kumar Purwar, IAS",
      dept: "Dept. of Higher & Technical Education, Government of Jharkhand",
      image: "/images/leadership/rahul_purwar.png",
      initial: "RP",
    },
  ];

  const recentUpdates = [
    {
      date: "21 APR",
      category: "Notification/Circular",
      title: "Clarifications for Jharkhand State Societal Innovation & Startup Policy 2026-28",
      ref: "DHTE/SICP/NOTIF-2026/04",
      isNew: true,
    },
    {
      date: "16 APR",
      category: "Government Resolutions",
      title: "Geospatial Boundary Integration with JSAC & PM GatiShakti for District Grievances",
      ref: "GR-JSAC-GATI-2026-09",
      isNew: true,
    },
    {
      date: "12 OCT",
      category: "Government Resolutions",
      title: "Setting up of AI Triage & Semantic Matching Taskforce in the State of Jharkhand",
      ref: "GR-JAPIT-TASKFORCE-88",
      isNew: false,
    },
    {
      date: "11 OCT",
      category: "Policy Guidelines",
      title: "Modification and Addendum to Academic Capstone Credit Allocation Framework",
      ref: "JUT-DHTE-ADDENDUM-14",
      isNew: false,
    },
  ];

  const innovationPolicies = [
    {
      title: "Jharkhand SpaceTech Policy",
      period: "2025 - 2030",
      desc: "JSAC satellite telemetry, drought prediction & rural GIS mapping infrastructure.",
      tag: "Deep Tech",
      active: false,
    },
    {
      title: "Jharkhand Startup Policy",
      period: "2025 - 2030",
      desc: "Incubation centers co-financing grassroots university research labs.",
      tag: "CSR & Industry",
      active: true,
    },
    {
      title: "Electronics & Sensor Policy",
      period: "2022 - 2028",
      desc: "Hardware fabrication subsidies for student IoT and embedded water sensors.",
      tag: "Hardware R&D",
      active: false,
    },
    {
      title: "Semiconductor Mission",
      period: "2022 - 2027",
      desc: "Indigenous chip design & sensor prototyping for community challenges.",
      tag: "Fabrication",
      active: false,
    },
    {
      title: "Jharkhand IT/ITeS Policy",
      period: "2022 - 2027",
      desc: "Automated AI grievance classification & public audit ledgers.",
      tag: "e-Governance",
      active: false,
    },
  ];

  const ecosystemNodes = [
    { name: "Directorate of Higher & Technical Education", role: "Policy & Academic Oversight", icon: Building2 },
    { name: "Jharkhand Agency for Promotion of IT (JAP-IT)", role: "State Systems Implementation", icon: Server },
    { name: "Jharkhand Space Applications Center (JSAC)", role: "Geospatial GIS & Remote Sensing", icon: Radio },
    { name: "JharNet (Jharkhand State WAN)", role: "Last-Mile Rural Connectivity", icon: Zap },
    { name: "Jharkhand Council on Science & Tech (JCSTI)", role: "Academic Research Financing", icon: Award },
    { name: "Jharkhand University of Technology (JUT)", role: "Curriculum & Capstone Accreditation", icon: GraduationCap },
    { name: "BIT Mesra & IIT (ISM) Dhanbad Incubators", role: "Startup Commercialization", icon: Briefcase },
    { name: "Jharkhand State Data Center (JSDC Ranchi)", role: "Secure Sovereign Cloud Compute", icon: ShieldCheck },
  ];

  const projectsAndInitiatives = [
    {
      title: "JharNet & Rural Wi-Fi Grid",
      code: "JharNet Wi-Fi",
      desc: "High-speed block and panchayat connectivity enabling citizen grievance geotagging and real-time sensor uploads.",
      tag: "Connectivity",
      icon: Radio,
    },
    {
      title: "Jharkhand State Data Center",
      code: "JSDC Cloud",
      desc: "Tier-III sovereign data infrastructure in Ranchi hosting state innovation repositories and AI triage engines.",
      tag: "Cloud Infrastructure",
      icon: Server,
    },
    {
      title: "JharSewa Workflow Engine",
      code: "JharSewa",
      desc: "End-to-end digital administrative routing connecting District Commissioners with University Deans.",
      tag: "e-Governance",
      icon: FileText,
    },
    {
      title: "Jharkhand Cyber Security Ops",
      code: "J-CSOC Center",
      desc: "24x7 threat monitoring and SHA-256 cryptographic audit logs guaranteeing grant transparency.",
      tag: "Cyber Security",
      icon: ShieldCheck,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-0 text-[#0F172A]">
        {/* SECTION 1: HERO SECTION WITH FULL-WIDTH AERIAL FOREST PHOTOGRAPHY */}
        <div className="relative text-white overflow-hidden border-b border-[#E2E8F0] min-h-[480px] sm:min-h-[520px] flex flex-col justify-between">
          {/* Background Aerial Forest Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/hero/forest_aerial.jpg')",
            }}
          />

          {/* Light Optimistic Institutional Overlay (5–8% White Tint with subtle high-contrast gradient) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#052E16]/85 via-[#14532D]/75 to-[#052E16]/70" />

          {/* Hero Content Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10 w-full my-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Main Content */}
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                  <span>🌿 National Sustainability & Innovation Mission</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-sans">
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-emerald-100 max-w-2xl leading-relaxed">
                  {heroSlides[currentSlide].subtitle}
                </p>

                <div className="text-xs text-emerald-200/90 font-medium pt-1">
                  {heroSlides[currentSlide].tagline}
                </div>

                {/* Primary National CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  <Link
                    href="/citizen/submit-problem"
                    className="px-5 py-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2 border border-emerald-400/30"
                  >
                    <span>Report Citizen Challenge</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/university/dashboard"
                    className="px-5 py-3 rounded-lg bg-white hover:bg-slate-100 text-[#166534] text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>University Innovation Cell</span>
                  </Link>

                  <Link
                    href="/partnerships"
                    className="px-4 py-3 rounded-lg bg-black/30 hover:bg-black/40 border border-white/30 text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 backdrop-blur-xs"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>CSR Industry Portal</span>
                  </Link>
                </div>
              </div>

              {/* Right Hero Visual Card */}
              <div className="lg:col-span-4 hidden lg:block">
                <div className="bg-[#052E16]/80 backdrop-blur-md border border-emerald-500/30 rounded-lg p-6 space-y-4 text-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-emerald-700/50 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Institutional Workflow
                    </span>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/30 font-semibold">
                      Live Portal
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3 p-2.5 rounded bg-black/30 border border-emerald-600/30">
                      <span className="h-6 w-6 rounded bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </span>
                      <div>
                        <div className="font-bold text-white">Citizen Problem Intake</div>
                        <div className="text-[11px] text-emerald-200/80">Geotagged field evidence & impact rating</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded bg-black/30 border border-emerald-600/30">
                      <span className="h-6 w-6 rounded bg-[#166534] border border-emerald-400/40 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </span>
                      <div>
                        <div className="font-bold text-white">University & Faculty Assignment</div>
                        <div className="text-[11px] text-emerald-200/80">Department triage & student squad formation</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded bg-black/30 border border-emerald-600/30">
                      <span className="h-6 w-6 rounded bg-[#15803D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        3
                      </span>
                      <div>
                        <div className="font-bold text-white">CSR Funding & Field Deployment</div>
                        <div className="text-[11px] text-emerald-200/80">Verified outcome & public ledger audit</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 flex items-center justify-between text-xs text-emerald-200 relative z-10 w-full">
            <div className="flex items-center gap-1.5">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    currentSlide === idx ? "w-8 bg-[#22C55E]" : "w-2 bg-white/40 hover:bg-white/70"
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                className="p-1.5 rounded bg-black/30 hover:bg-black/50 border border-emerald-500/30"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
                className="p-1.5 rounded bg-black/30 hover:bg-black/50 border border-emerald-500/30"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: KEY NATIONAL STATISTICS STRIP */}
        <div className="bg-[#EEF2F7] py-8 border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {nationalStats.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.label}
                    className="bg-white border border-[#E2E8F0] rounded-lg p-4 space-y-1 shadow-xs hover:border-[#166534] transition-colors"
                  >
                    <Icon className="h-5 w-5 text-[#166534] mb-1" />
                    <div className="text-xl font-bold text-[#0F172A]">{st.value}</div>
                    <div className="text-xs font-semibold text-[#475569] leading-tight">{st.label}</div>
                    <div className="text-[10px] text-[#64748B]">{st.subtext}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: LEADERSHIP & RECENT UPDATES */}
        <div className="bg-white py-12 border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 5-Cols: Leadership Section */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border-b-2 border-[#166534] pb-2">
                  <h2 className="text-lg font-bold text-[#0F172A] uppercase tracking-wide">
                    Program Leadership & Governance
                  </h2>
                </div>

                <div className="space-y-3">
                  {leadership.map((l) => (
                    <div
                      key={l.name}
                      className="flex items-center gap-3.5 p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#166534]/50 transition-colors"
                    >
                      {l.image ? (
                        <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 border-2 border-[#166534]/40 bg-white shadow-xs">
                          <img
                            src={l.image}
                            alt={l.name}
                            className="h-full w-full object-cover object-top scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-[#166534] text-white flex items-center justify-center font-bold text-lg shrink-0 border-2 border-[#14532D]">
                          {l.initial}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-[#0F172A] leading-snug">{l.name}</div>
                        <div className="text-xs font-semibold text-[#166534]">{l.role}</div>
                        <div className="text-[11px] text-[#475569] truncate">{l.dept}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 7-Cols: Recent Updates / Circulars */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b-2 border-[#166534] pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#0F172A] uppercase tracking-wide">
                    Recent Updates & Circulars
                  </h2>
                  <Link href="/transparency" className="text-xs font-semibold text-[#166534] hover:underline">
                    Archive &rarr;
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {recentUpdates.map((up, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-3 bg-white border border-[#E2E8F0] rounded-lg hover:border-[#166534] transition-colors"
                    >
                      {/* Date Badge (Forest Green Pill) */}
                      <div className="bg-[#166534] text-white text-center rounded-md px-2.5 py-1.5 shrink-0 min-w-[54px]">
                        <div className="text-xs font-bold leading-none">{up.date.split(" ")[0]}</div>
                        <div className="text-[9px] uppercase font-semibold leading-none mt-0.5 text-emerald-200">
                          {up.date.split(" ")[1]}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] bg-[#EEF2F7] px-2 py-0.5 rounded border border-[#E2E8F0]">
                            📁 {up.category}
                          </span>
                          {up.isNew && (
                            <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                              NEW
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug hover:text-[#166534] cursor-pointer">
                          {up.title}
                        </h3>
                        <div className="text-[11px] text-[#64748B] font-mono">Ref: {up.ref}</div>
                      </div>

                      <Download className="h-4 w-4 text-gray-400 hover:text-[#166534] cursor-pointer shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: NATIONAL INNOVATION POLICIES */}
        <div className="bg-[#14532D] text-white py-12 border-b border-[#052E16]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-700/60 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  National Innovation & Strategic Policies
                </h2>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Frameworks governing university credit allocations, CSR grants, and sustainability missions
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-200 bg-[#052E16]/60 px-3 py-1 rounded border border-emerald-500/30">
                AICTE / DST Frameworks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {innovationPolicies.map((pol) => (
                <div
                  key={pol.title}
                  className={cn(
                    "rounded-lg p-4 space-y-3 flex flex-col justify-between transition-all border",
                    pol.active
                      ? "bg-[#166534] border-[#22C55E] ring-2 ring-[#22C55E]/40 shadow-lg"
                      : "bg-[#052E16]/40 border-emerald-700/40 hover:border-emerald-500/60"
                  )}
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-emerald-300 bg-white/10 px-2 py-0.5 rounded">
                      {pol.tag}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug pt-1">{pol.title}</h3>
                    <div className="text-[11px] text-emerald-300 font-mono">{pol.period}</div>
                    <p className="text-xs text-emerald-100/90 leading-relaxed pt-1">{pol.desc}</p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/transparency"
                      className={cn(
                        "w-full py-1.5 rounded text-xs font-bold text-center block transition-colors",
                        pol.active
                          ? "bg-[#22C55E] text-slate-950 hover:bg-[#16A34A] hover:text-white"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      )}
                    >
                      {pol.active ? "Discover More" : "View Policy PDF"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5: COLLABORATIVE INNOVATION ECOSYSTEM */}
        <div className="bg-white py-12 border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534] bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                Institutional Network
              </span>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                National Collaborative Innovation Ecosystem
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
                Interconnecting governmental directorates, research councils, data centers, and university labs
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ecosystemNodes.map((node) => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.name}
                    className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#166534] transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-lg bg-emerald-50 text-[#166534] flex items-center justify-center border border-emerald-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">Affiliated</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug">{node.name}</h3>
                      <p className="text-[11px] text-[#475569] mt-0.5">{node.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 6: KEY PROJECTS & INITIATIVES */}
        <div className="bg-[#EEF2F7] py-12 border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] uppercase tracking-wide">
                  Flagship Projects & Digital Initiatives
                </h2>
                <p className="text-xs text-[#475569] mt-0.5">Core state digital infrastructure supporting SICP workflows</p>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-[#166534] hover:underline flex items-center gap-1"
              >
                <span>All Projects</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {projectsAndInitiatives.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.code}
                    className="bg-white border border-[#E2E8F0] rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-xs hover:border-[#166534] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-[#166534] flex items-center justify-center border border-emerald-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#166534] uppercase tracking-wide">
                          {p.tag}
                        </span>
                        <h3 className="text-sm font-bold text-[#0F172A] leading-snug">{p.title}</h3>
                        <div className="text-[11px] font-mono text-[#64748B] font-semibold">{p.code}</div>
                      </div>
                      <p className="text-xs text-[#475569] leading-relaxed">{p.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#166534]">
                      <span>View Infrastructure</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 7: NATIONAL PARTNERS STRIP */}
        <div className="bg-white py-8 border-b border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-xs font-bold uppercase tracking-wider text-[#64748B] mb-6">
              National Institutional & Technology Partners
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {[
                { name: "Digital India", sub: "MeitY Initiative" },
                { name: "India.gov.in", sub: "National Portal" },
                { name: "JSAC", sub: "Jharkhand Geospatial GIS" },
                { name: "JharNet", sub: "Jharkhand State WAN" },
                { name: "AICTE / JUT", sub: "Technical Education" },
                { name: "GeM", sub: "Government e-Marketplace" },
              ].map((partner) => (
                <div
                  key={partner.name}
                  className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center shadow-2xs"
                >
                  <span className="font-bold text-xs text-[#0F172A]">{partner.name}</span>
                  <span className="text-[10px] text-[#64748B]">{partner.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
