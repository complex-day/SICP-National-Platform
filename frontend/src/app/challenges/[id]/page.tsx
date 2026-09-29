"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ChallengeDetail } from "@/features/challenges/types/challenge.types";
import { ChallengeStatusBadge } from "@/features/challenge/components/ChallengeStatusBadge";
import { ChallengeUrgencyBadge } from "@/features/challenge/components/ChallengeUrgencyBadge";
import { ChallengeTimeline } from "@/features/challenge/components/ChallengeTimeline";
import { ExpressInterestModal } from "@/features/challenge/components/ExpressInterestModal";
import { challengeService } from "@/services/challenge.service";
import {
  MapPin,
  Users,
  Calendar,
  ThumbsUp,
  FileText,
  Image as ImageIcon,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Compass,
  Tag,
  Printer,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Award,
  AlertCircle,
  FileCheck,
  Video,
  ChevronRight,
  Info,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"images" | "documents" | "videos">("images");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadChallenge() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await challengeService.getChallenge(id);
        setChallenge(data);
        setUpvotes(data.upvotes || 0);
        setIsUpvoted(data.isUpvoted || false);
      } catch (err: any) {
        setError(err.message || "Failed to load challenge details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenge();
  }, [id]);

  const handleUpvote = async () => {
    if (!challenge || isUpvoting) return;
    try {
      setIsUpvoting(true);
      const res = await challengeService.upvoteChallenge(challenge.id);
      setUpvotes(res.upvotes);
      setIsUpvoted(res.isUpvoted);
    } catch (err) {
      console.error("Failed to upvote:", err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requireAuth={false}>
        <div className="py-24 text-center space-y-4">
          <div className="h-8 w-8 border-3 border-[#166534] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-gray-700">
            Querying National Challenge Dossier & Geospatial Repository...
          </div>
          <p className="text-xs text-gray-500">Retrieving audit timeline, GIS coordinates, and R&D milestone records.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !challenge) {
    return (
      <DashboardLayout requireAuth={false}>
        <div className="bg-white border border-[#E2E8F0] rounded-md p-10 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Challenge Record Not Found</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            {error || "The requested societal challenge does not exist or may have been archived by the administrative authority."}
          </p>
          <div className="pt-2">
            <Link
              href="/citizen/my-challenges"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#166534] text-white text-xs font-semibold rounded hover:bg-[#083b7a]"
            >
              &larr; Back to Grievance Register
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter media files
  const imageMedia = challenge.media?.filter(
    (m) => (m.type as string) === "image" || m.url?.includes("unsplash") || m.url?.includes("image") || m.url?.includes(".png") || m.url?.includes(".jpg")
  ) || [];
  const docMedia = challenge.media?.filter(
    (m) => (m.type as string) === "document" || m.url?.includes(".pdf") || m.url?.includes(".doc")
  ) || [];
  const videoMedia = challenge.media?.filter(
    (m) => (m.type as string) === "video" || m.url?.includes(".mp4")
  ) || [];

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        {/* Header & Official Grievance Ref Bar */}
        <div className="border-b border-[#E2E8F0] pb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/" className="hover:text-[#166534]">Portal</Link>
              <span>/</span>
              <Link href="/citizen/dashboard" className="hover:text-[#166534]">Citizen Command</Link>
              <span>/</span>
              <Link href="/citizen/my-challenges" className="hover:text-[#166534]">Register</Link>
              <span>/</span>
              <span className="text-gray-800 font-mono font-medium">{challenge.id.slice(0, 10).toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-300">
                REF: SICP-CHAL-{challenge.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Digitally Verified</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-2 max-w-4xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#166534] text-xs font-bold">
                  {challenge.category}
                </span>
                <ChallengeStatusBadge status={challenge.status} />
                <ChallengeUrgencyBadge urgency={challenge.urgency} />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#212121] tracking-tight">
                {challenge.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  {challenge.location.district}, {challenge.location.state}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-[#166534]" />
                  ~{challenge.affectedPopulation.toLocaleString()} citizens impacted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  Logged on {new Date(challenge.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleUpvote}
                disabled={isUpvoting}
                className={cn(
                  "px-3 py-2 rounded-md border text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs",
                  isUpvoted
                    ? "bg-blue-50 text-[#166534] border-blue-300"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                )}
                title="Upvote Challenge"
              >
                <ThumbsUp className={cn("h-3.5 w-3.5", isUpvoted && "fill-[#166534]")} />
                <span>{upvotes} Upvotes</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShare}
                className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Share Challenge Record"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Share2 className="h-3.5 w-3.5 text-gray-500" />}
                <span>{copiedLink ? "Link Copied" : "Share"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Print Official Grievance Dossier"
              >
                <Printer className="h-3.5 w-3.5 text-gray-500" />
                <span>Print Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInterestModalOpen(true)}
                className="px-4 py-2 rounded-md bg-[#166534] hover:bg-[#083b7a] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#F57C00]" />
                <span>Propose Solution</span>
              </button>
            </div>
          </div>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 8-Cols Left Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Problem Statement & Detailed Scope Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    Problem Statement & Field Scope
                  </h2>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">Public Grievance Record</span>
              </div>

              <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {challenge.description}
                </div>

                {challenge.tags && challenge.tags.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[11px] font-semibold text-gray-500">Domain Tags:</span>
                    {challenge.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Full Lifecycle Audit & Verification Timeline */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    Lifecycle Audit & Stage Progression
                  </h2>
                </div>
                <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Status: {challenge.status.replace("_", " ")}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <ChallengeTimeline
                  currentStatus={challenge.status}
                  events={challenge.timeline}
                />
              </div>
            </div>

            {/* 3. AI Triage & Semantic Intelligence Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#F57C00]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    AI Automated Triage & Semantic Analysis
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-gray-500">Model: SICP-BERT-v2</span>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Sector Classification
                    </span>
                    <div className="font-bold text-[#166534] text-sm mt-0.5">{challenge.category}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      98.6% NLP Confidence
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Duplicate Redundancy Check
                    </span>
                    <div className="font-bold text-emerald-800 text-sm mt-0.5">0 Clones Detected</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">5km radius spatial index</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Priority Vector Score
                    </span>
                    <div className="font-bold text-[#F57C00] text-sm mt-0.5">8.9 / 10.0</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">High Community Impact</div>
                  </div>
                </div>

                <div className="border border-blue-100 bg-blue-50/50 rounded p-3.5 text-xs space-y-1.5">
                  <div className="font-bold text-[#166534] flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    <span>Recommended Technical Intervention Pathway</span>
                  </div>
                  <p className="text-gray-700 text-[11px] leading-relaxed">
                    AI recommendation suggests engineering solutions involving IoT telemetry sensors, low-cost community filtration prototypes, or decentralized water testing squads suitable for academic research initiatives and capstone engineering batches.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Tabbed Field Evidence & Document Repository */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    Field Evidence & Attachments ({challenge.media?.length || 0})
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded p-0.5 text-xs">
                  <button
                    onClick={() => setActiveMediaTab("images")}
                    className={cn(
                      "px-2.5 py-1 rounded font-semibold transition-colors",
                      activeMediaTab === "images" ? "bg-[#166534] text-white" : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Photos ({imageMedia.length})
                  </button>
                  <button
                    onClick={() => setActiveMediaTab("documents")}
                    className={cn(
                      "px-2.5 py-1 rounded font-semibold transition-colors",
                      activeMediaTab === "documents" ? "bg-[#166534] text-white" : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Docs ({docMedia.length})
                  </button>
                  <button
                    onClick={() => setActiveMediaTab("videos")}
                    className={cn(
                      "px-2.5 py-1 rounded font-semibold transition-colors",
                      activeMediaTab === "videos" ? "bg-[#166534] text-white" : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Videos ({videoMedia.length})
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {activeMediaTab === "images" && (
                  imageMedia.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {imageMedia.map((m) => (
                        <div
                          key={m.id}
                          className="border border-[#E2E8F0] rounded overflow-hidden bg-gray-50 group hover:border-[#166534] transition-colors"
                        >
                          <div
                            onClick={() => setSelectedImage(m.url)}
                            className="h-36 w-full overflow-hidden bg-gray-200 cursor-pointer relative"
                          >
                            <img
                              src={m.url}
                              alt={m.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                              Click to Enlarge
                            </div>
                          </div>
                          <div className="p-2.5 flex items-center justify-between text-xs">
                            <span className="truncate max-w-[150px] font-medium text-gray-800">{m.name}</span>
                            <a
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-500 hover:text-[#166534]"
                              title="Download Full Image"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-500 italic">
                      No photographic evidence attached to this record.
                    </div>
                  )
                )}

                {activeMediaTab === "documents" && (
                  docMedia.length > 0 ? (
                    <div className="space-y-2">
                      {docMedia.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-[#E2E8F0] rounded text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-[#F57C00]" />
                            <span className="font-semibold text-gray-800">{m.name}</span>
                            <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                              Official PDF Attachment
                            </span>
                          </div>
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#166534] hover:underline font-semibold"
                          >
                            <span>Download PDF</span>
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-500 italic">
                      No document or PDF reports uploaded with this grievance.
                    </div>
                  )
                )}

                {activeMediaTab === "videos" && (
                  videoMedia.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videoMedia.map((m) => (
                        <div key={m.id} className="border border-[#E2E8F0] rounded p-3 bg-gray-50 text-xs space-y-2">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-[#0369A1]" />
                            <span className="font-semibold text-gray-800">{m.name}</span>
                          </div>
                          <div className="h-32 bg-gray-800 rounded flex items-center justify-center text-white text-xs">
                            <span>Field Video Recording (MP4)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-500 italic">
                      No video footage attached to this grievance record.
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 5. Project Execution Roadmap & Milestones */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#166534]" />
                  <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                    Academic R&D Execution Stages
                  </h2>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">State Innovation Framework</span>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {/* Stage 1 */}
                  <div className="border border-emerald-300 bg-emerald-50/50 rounded p-3 space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 font-bold">
                      <span>Stage 1: Survey</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-gray-600">Field site survey & problem formulation</p>
                    <span className="text-[10px] font-bold text-emerald-700 block pt-1">100% Completed</span>
                  </div>

                  {/* Stage 2 */}
                  <div className="border border-blue-300 bg-blue-50/50 rounded p-3 space-y-1">
                    <div className="flex items-center justify-between text-[#166534] font-bold">
                      <span>Stage 2: Prototype</span>
                      <Clock className="h-3.5 w-3.5 text-[#166534]" />
                    </div>
                    <p className="text-[11px] text-gray-600">Lab prototyping & simulation modeling</p>
                    <span className="text-[10px] font-bold text-[#166534] block pt-1">In Active R&D</span>
                  </div>

                  {/* Stage 3 */}
                  <div className="border border-gray-200 bg-gray-50 rounded p-3 space-y-1 opacity-80">
                    <div className="flex items-center justify-between text-gray-700 font-bold">
                      <span>Stage 3: Testing</span>
                      <span className="text-[10px] text-gray-400">Scheduled</span>
                    </div>
                    <p className="text-[11px] text-gray-500">On-site community trials & safety tests</p>
                    <span className="text-[10px] font-semibold text-gray-500 block pt-1">Pending</span>
                  </div>

                  {/* Stage 4 */}
                  <div className="border border-gray-200 bg-gray-50 rounded p-3 space-y-1 opacity-80">
                    <div className="flex items-center justify-between text-gray-700 font-bold">
                      <span>Stage 4: Handover</span>
                      <span className="text-[10px] text-gray-400">Scheduled</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Municipal integration & verified resolution</p>
                    <span className="text-[10px] font-semibold text-gray-500 block pt-1">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar 4-Cols Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status & SLA Panel */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-[#E2E8F0]">
                <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wide">
                  Official Status & SLA Schedule
                </h3>
              </div>

              <div className="p-4 space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block uppercase">Current Processing State</span>
                  <div className="mt-1">
                    <ChallengeStatusBadge status={challenge.status} />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block uppercase">Target Resolution SLA</span>
                  <div className="font-bold text-gray-800 text-sm mt-0.5">30 - 45 Calendar Days</div>
                  <span className="text-[10px] text-gray-500">Under District Nodal Officer Monitoring</span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-500 font-semibold block uppercase">Citizen Submitter</span>
                  <div className="font-bold text-gray-800 text-xs mt-0.5">{challenge.citizenName}</div>
                  <span className="text-[10px] text-emerald-700 font-medium">Verified Citizen Contributor</span>
                </div>
              </div>
            </div>

            {/* Assigned Academic Institution Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#166534]" />
                  <span>Assigned University R&D</span>
                </h3>
                {challenge.claimedBy && (
                  <span className="text-[10px] font-bold text-[#166534] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Allocated
                  </span>
                )}
              </div>

              <div className="p-4 text-xs space-y-3">
                {challenge.claimedBy ? (
                  <>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Lead Institution</span>
                      <div className="font-bold text-gray-900 mt-0.5">{challenge.claimedBy.institution}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Research Squad</span>
                      <div className="font-medium text-[#166534] mt-0.5">{challenge.claimedBy.teamName}</div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>Assignment Date:</span>
                      <span className="font-medium text-gray-800">
                        {challenge.claimedBy.claimedAt
                          ? new Date(challenge.claimedBy.claimedAt).toLocaleDateString()
                          : "2026-09-15"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-gray-500 text-xs">
                      No university research team has claimed this challenge yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsInterestModalOpen(true)}
                      className="w-full py-2 px-3 bg-[#166534] hover:bg-[#083b7a] text-white text-xs font-bold rounded transition-colors"
                    >
                      Propose Academic Solution
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PM GatiShakti Geospatial Card */}
            <div className="bg-white border border-[#E2E8F0] rounded-md shadow-xs overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  <span>Geospatial Jurisdiction</span>
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">EPSG:4326</span>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">State & District</span>
                  <div className="font-bold text-gray-800 mt-0.5">
                    {challenge.location.district}, {challenge.location.state}
                  </div>
                  {challenge.location.address && (
                    <p className="text-[11px] text-gray-600 mt-0.5">{challenge.location.address}</p>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">GPS Boundary Point</div>
                  <div className="font-mono text-[11px] text-[#166534] font-bold">
                    {challenge.location.latitude}° N, {challenge.location.longitude}° E
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${challenge.location.latitude},${challenge.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#166534] hover:underline font-semibold pt-1"
                  >
                    <span>View in Google Maps GIS</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Support CTA Box */}
            <div className="bg-[#166534]/5 border border-[#166534]/20 rounded-md p-4 text-xs space-y-3">
              <div className="font-bold text-[#166534] flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#F57C00]" />
                <span>Academic & Industry Collaboration</span>
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Faculty mentors, incubation centers, and CSR sponsors can co-finance or provide mentorship for this problem statement.
              </p>
              <button
                type="button"
                onClick={() => setIsInterestModalOpen(true)}
                className="w-full py-2 bg-[#166534] hover:bg-[#083b7a] text-white text-xs font-bold rounded transition-colors shadow-2xs"
              >
                Submit Project Proposal
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Express Interest */}
        <ExpressInterestModal
          challenge={challenge}
          isOpen={isInterestModalOpen}
          onClose={() => setIsInterestModalOpen(false)}
          onSuccess={() => {
            // Optional success callback
          }}
        />

        {/* Image Preview Lightbox Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-md border border-white/20 bg-black">
              <img src={selectedImage} alt="Enlarged evidence preview" className="w-full h-auto object-contain" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
