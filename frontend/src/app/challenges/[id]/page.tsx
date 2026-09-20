"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ChallengeDetail } from "@/features/challenges/types/challenge.types";
import { ChallengeStatusBadge } from "@/features/challenge/components/ChallengeStatusBadge";
import { ChallengeUrgencyBadge } from "@/features/challenge/components/ChallengeUrgencyBadge";
import { ChallengeTimeline } from "@/features/challenge/components/ChallengeTimeline";
import { ExpressInterestModal } from "@/features/challenge/components/ExpressInterestModal";
import { ChallengeCard } from "@/features/challenge/components/ChallengeCard";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <DashboardLayout requireAuth={false}>
        <LoadingState message="Loading challenge details & geospatial information..." />
      </DashboardLayout>
    );
  }

  if (error || !challenge) {
    return (
      <DashboardLayout requireAuth={false}>
        <ErrorState
          title="Challenge Not Found"
          message={error || "The requested societal challenge does not exist or may have been removed."}
          onRetry={() => router.push("/challenges")}
          showHomeButton={true}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requireAuth={false}>
      <div className="space-y-6">
        <PageHeader
          title={challenge.title}
          badge={
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                {challenge.category}
              </span>
              <ChallengeStatusBadge status={challenge.status} />
              <ChallengeUrgencyBadge urgency={challenge.urgency} />
            </div>
          }
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Challenges", href: "/challenges" },
            { label: challenge.title },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpvote}
                disabled={isUpvoting}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  isUpvoted
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border hover:bg-muted text-foreground"
                )}
                title="Upvote Challenge"
              >
                <ThumbsUp className={cn("h-4 w-4", isUpvoted && "fill-current")} />
                <span>{upvotes} Upvotes</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInterestModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Express Interest</span>
              </button>
            </div>
          }
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 8-Cols Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Challenge Overview */}
            <div className="glass-panel rounded-2xl border border-border/80 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Problem Statement & Scope</span>
              </h2>
              <div className="text-sm text-foreground/90 leading-relaxed space-y-3 whitespace-pre-wrap">
                {challenge.description}
              </div>

              {challenge.tags && challenge.tags.length > 0 && (
                <div className="flex items-center gap-2 pt-4 border-t border-border/60 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {challenge.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md bg-muted text-[11px] font-semibold text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Geospatial Information */}
            <div className="glass-panel rounded-2xl border border-border/80 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Location & Geospatial Data</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                    District & State
                  </span>
                  <div className="text-sm font-bold text-foreground">
                    {challenge.location.district}, {challenge.location.state}
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">{challenge.location.address}</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                    GPS Coordinates
                  </span>
                  <div className="text-sm font-mono font-bold text-primary flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    <span>
                      {challenge.location.latitude}° N, {challenge.location.longitude}° E
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${challenge.location.latitude},${challenge.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline pt-1 font-semibold"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Section 3: Uploaded Evidence Media */}
            <div className="glass-panel rounded-2xl border border-border/80 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <span>Field Evidence & Attachments ({challenge.media?.length || 0})</span>
              </h2>

              {challenge.media && challenge.media.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {challenge.media.map((media) => {
                    const isImg = media.type === "image" || media.url?.includes("unsplash") || media.url?.includes("http");
                    return (
                      <div
                        key={media.id}
                        className="rounded-xl border border-border bg-background/60 overflow-hidden group hover:border-primary/50 transition-all shadow-2xs"
                      >
                        {isImg ? (
                          <div
                            onClick={() => setSelectedImage(media.url)}
                            className="h-36 w-full relative overflow-hidden bg-muted cursor-pointer"
                          >
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                              Click to Enlarge
                            </div>
                          </div>
                        ) : (
                          <div className="h-36 w-full bg-muted/60 flex flex-col items-center justify-center p-4 text-center">
                            <FileText className="h-10 w-10 text-primary mb-2" />
                            <span className="text-xs font-bold text-foreground line-clamp-1">
                              {media.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">Document File</span>
                          </div>
                        )}

                        <div className="p-3 flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground truncate max-w-[140px]">
                            {media.name}
                          </span>
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md text-muted-foreground hover:text-primary transition-colors"
                            title="Download/Open Attachment"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No photographic or document evidence attached to this challenge.
                </p>
              )}
            </div>

            {/* Section 4: Status Timeline */}
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>Verification & Status Timeline</span>
              </h2>
              <ChallengeTimeline
                currentStatus={challenge.status}
                events={challenge.timeline}
              />
            </div>

            {/* Section 5: Related Challenges */}
            {challenge.relatedChallenges && challenge.relatedChallenges.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border/80">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Related Challenges in {challenge.category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {challenge.relatedChallenges.map((rel) => (
                    <ChallengeCard key={rel.id} challenge={rel} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar 4-Cols Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Metadata Summary Card */}
            <div className="glass-panel rounded-2xl border border-border/80 p-6 space-y-5 shadow-sm sticky top-6">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Challenge Metadata
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Domain Category</span>
                  <div className="font-bold text-foreground mt-0.5 text-sm">
                    {challenge.category}
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Urgency Tier</span>
                  <div className="mt-1">
                    <ChallengeUrgencyBadge urgency={challenge.urgency} />
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Affected Citizens</span>
                  <div className="font-bold text-foreground mt-0.5 text-sm flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    <span>~{challenge.affectedPopulation.toLocaleString()} people</span>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Reported By</span>
                  <div className="font-bold text-foreground mt-0.5">
                    {challenge.citizenName}
                  </div>
                  <span className="text-muted-foreground text-[10px]">Verified Citizen Contributor</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Submission Date</span>
                  <div className="font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {challenge.claimedBy && (
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Claimed Academic Team
                    </span>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{challenge.claimedBy.teamName}</span>
                    </div>
                    <p className="text-[11px] text-purple-700">{challenge.claimedBy.institution}</p>
                  </div>
                )}
              </div>

              {/* Express Interest Call to Action */}
              <div className="pt-4 border-t border-border/60 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsInterestModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Express Interest to Solve</span>
                </button>
                <p className="text-[11px] text-muted-foreground text-center">
                  University research labs, faculty mentors & CSR sponsors can propose solutions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Express Interest */}
        <ExpressInterestModal
          challenge={challenge}
          isOpen={isInterestModalOpen}
          onClose={() => setIsInterestModalOpen(false)}
          onSuccess={() => {
            // Optional callback
          }}
        />

        {/* Image Preview Lightbox Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-border">
              <img src={selectedImage} alt="Enlarged evidence preview" className="w-full h-auto object-contain" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
