"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChallengeDetail } from "@/features/challenge/types/challenge.types";
import { ChallengeStatusBadge } from "@/features/challenge/components/ChallengeStatusBadge";
import { ChallengeAssetGallery } from "@/features/challenge/components/ChallengeAssetGallery";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadChallenge() {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await challengeService.getChallenge(id, token);
        setChallenge(data);
      } catch (err: any) {
        setError(err.message || "Failed to load challenge details");
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenge();
  }, [id, token]);

  const handleDelete = async () => {
    if (!token || !challenge) return;
    if (!confirm("Are you sure you want to delete this draft challenge?")) return;

    try {
      setIsDeleting(true);
      await challengeService.deleteChallenge(challenge.id, token);
      router.push("/citizen/my-challenges");
    } catch (err: any) {
      alert(err.message || "Failed to delete challenge");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Challenge Not Accessible</h2>
          <p className="text-xs text-zinc-400">{error || "This challenge does not exist or you do not have permission to view it."}</p>
          <Link
            href="/challenges"
            className="inline-block px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Return to Challenges Catalog
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === challenge.created_by;
  const isDraft = challenge.status === "draft";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Breadcrumbs & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/challenges"
            className="text-xs font-semibold text-zinc-400 hover:text-emerald-400 inline-flex items-center gap-1"
          >
            &larr; Back to Challenges
          </Link>

          {isAuthor && isDraft && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Draft"}
            </button>
          )}
        </div>

        {/* Challenge Header Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {challenge.category} {challenge.subcategory ? `• ${challenge.subcategory}` : ""}
            </span>
            <ChallengeStatusBadge status={challenge.status} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">{challenge.title}</h1>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block">Affected Population</span>
              <span className="text-zinc-200 font-semibold text-sm">
                ~{challenge.affected_population.toLocaleString()} citizens
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Location</span>
              <span className="text-zinc-200 font-semibold text-sm">
                {challenge.location.district || "District"}, {challenge.location.state || "State"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Reported On</span>
              <span className="text-zinc-200 font-semibold text-sm">
                {new Date(challenge.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100">Problem Description</h2>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {challenge.description}
          </p>
        </div>

        {/* Location & Coordinates */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100">Geospatial Information</h2>
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block mb-1">GPS Coordinates:</span>
              <span className="font-mono text-emerald-400">
                Lat: {challenge.location.lat}, Lng: {challenge.location.lng}
              </span>
            </div>
            {challenge.location.address_text && (
              <div>
                <span className="text-zinc-400 block mb-1">Address / Landmark:</span>
                <span className="text-zinc-200">{challenge.location.address_text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Evidence Assets Gallery */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100">Evidence & Field Attachments</h2>
          <ChallengeAssetGallery assets={challenge.assets} />
        </div>
      </div>
    </div>
  );
}
