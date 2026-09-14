"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChallengeForm } from "@/features/challenge/components/ChallengeForm";
import { ChallengeFormValues } from "@/features/challenge/schemas/challenge.schema";
import { MediaType } from "@/features/challenge/types/challenge.types";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";

export default function CreateChallengePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (
    data: ChallengeFormValues,
    files: { file: File; mediaType: MediaType }[]
  ) => {
    if (!token) {
      setErrorMessage("Please log in to submit a challenge.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // 1. Create Challenge
      const created = await challengeService.createChallenge(data, token);

      // 2. Upload any selected assets
      if (files.length > 0) {
        for (const item of files) {
          await challengeService.uploadAsset(created.id, item.file, item.mediaType, token);
        }
      }

      // 3. Redirect to My Challenges or Detail View
      router.push(`/citizen/my-challenges`);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while saving the challenge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Report a <span className="text-emerald-400">Societal Challenge</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Submit local issues in water, healthcare, infrastructure, or agriculture to connect with university research teams and innovation partners.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8 backdrop-blur-sm">
          <ChallengeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}
