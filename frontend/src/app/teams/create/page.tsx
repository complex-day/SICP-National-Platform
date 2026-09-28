"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { PRESET_SKILLS, Skill } from "@/features/teams/types/team.types";
import { Challenge } from "@/features/challenges/types/challenge.types";
import { teamService } from "@/services/team.service";
import { challengeService } from "@/services/challenge.service";
import { useAuthStore } from "@/store/authStore";
import {
  Users,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronLeft,
  Building2,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateTeamPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [challengeId, setChallengeId] = useState<string>("");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "IoT",
    "Embedded",
    "Frontend",
  ]);
  const [minMembers, setMinMembers] = useState<number>(2);
  const [maxMembers, setMaxMembers] = useState<number>(6);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available challenges for linking
  useEffect(() => {
    async function loadChallenges() {
      try {
        const res = await challengeService.listChallenges({ limit: 50 });
        setChallenges(res.items);
      } catch (err) {
        console.error("Failed to load challenges:", err);
      }
    }
    loadChallenges();
  }, []);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 4) {
      setError("Please enter a valid squad name (minimum 4 characters).");
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setError("Please describe the team charter and technical approach (minimum 20 characters).");
      return;
    }
    if (selectedSkills.length === 0) {
      setError("Please select at least 1 required technical skill tag.");
      return;
    }
    if (minMembers < 2) {
      setError("Minimum squad roster limit must be at least 2 members.");
      return;
    }
    if (maxMembers > 6) {
      setError("Maximum squad roster limit cannot exceed 6 members.");
      return;
    }
    if (minMembers > maxMembers) {
      setError("Minimum members cannot exceed maximum members.");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedChallenge = challenges.find((c) => c.id === challengeId);

      const created = await teamService.createTeam(
        {
          name: name.trim(),
          description: description.trim(),
          challengeId: challengeId || undefined,
          challengeTitle: selectedChallenge?.title || undefined,
          challengeCategory: selectedChallenge?.category || "Multidisciplinary Research",
          requiredSkills: selectedSkills,
          minMembers,
          maxMembers,
        },
        {
          id: user?.id || "usr-current",
          name: user?.full_name || "Lead Innovator",
          email: user?.email || "innovator@university.edu",
          institution: "University Innovation Center",
          department: "Department of Technology & Engineering",
        }
      );

      router.push(`/teams/${created.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to establish team squad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout requireAuth={false}>
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader
          title="Form a Multidisciplinary Team"
          description="Establish a collaborative innovation squad, link a verified civic challenge, and specify open skill slots for student and faculty recruitment."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Teams", href: "/teams" },
            { label: "Create Team" },
          ]}
        />

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="glass-panel border border-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm"
        >
          {/* Section 1: Team Basics */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">Squad Identity & Charter</h3>
              <p className="text-xs text-muted-foreground">
                Give your squad a descriptive name and mission statement.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Team Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., IIT Roorkee HydroTech Squad"
                className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Team Mission & Technical Focus *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the team's planned hardware/software architecture, methodology, and collaborative goals..."
                className="w-full rounded-xl bg-background border border-border p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Challenge Assignment */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">Link Grassroots Challenge</h3>
              <p className="text-xs text-muted-foreground">
                Connect your team to an active challenge from the Public Marketplace.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Target Civic Challenge (Optional)
              </label>
              <select
                value={challengeId}
                onChange={(e) => setChallengeId(e.target.value)}
                className="w-full rounded-xl bg-background border border-border px-3.5 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="">-- Independent Capstone / Autonomous Project --</option>
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.category}] {c.title} (~{c.affectedPopulation.toLocaleString()} citizens)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Required Skills */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">Required Technical Skills</h3>
              <p className="text-xs text-muted-foreground">
                Select competencies your squad requires from potential applicants.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_SKILLS.map((sk) => {
                const isSelected = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-1.5",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{sk}</span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Member Limits */}
          <div className="space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">Roster Constraints</h3>
              <p className="text-xs text-muted-foreground">
                Multidisciplinary squads are constrained between 2 to 6 members to ensure optimal capstone collaboration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Minimum Members
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={minMembers}
                  onChange={(e) => setMinMembers(parseInt(e.target.value) || 2)}
                  className="w-full rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground font-semibold"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Minimum squad threshold is 2.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Maximum Members
                </label>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value) || 6)}
                  className="w-full rounded-lg bg-background border border-border px-3 py-1.5 text-xs text-foreground font-semibold"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Upper cap per competition guidelines is 6.
                </span>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/teams")}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] shadow-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#166534] text-white font-bold text-xs hover:bg-[#14532D] transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSubmitting ? "Creating Squad..." : "Create Squad Workspace"}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
