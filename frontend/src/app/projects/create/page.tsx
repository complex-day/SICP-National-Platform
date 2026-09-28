"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui";
import { projectService } from "@/services/project.service";
import { academicService } from "@/services/academic.service";
import { Faculty, ChallengeAssignment } from "@/features/academic/types/academic.types";
import {
  Layers,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  GraduationCap,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Code2,
} from "lucide-react";

const CATEGORIES = [
  "Water Conservation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Infrastructure",
  "Clean Energy",
  "Smart Cities",
  "Waste Management",
];

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Water Conservation");
  const [challengeTitle, setChallengeTitle] = useState("Smart Rural Groundwater Recharge & Contaminant Sensing");
  const [challengeId, setChallengeId] = useState("chal-auto-01");

  // Team & Mentor
  const [teamName, setTeamName] = useState("Team JalShakti Alpha");
  const [teamLeadName, setTeamLeadName] = useState("Aarav Sharma");
  const [teamMembersCount, setTeamMembersCount] = useState<number>(5);

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [challengesList, setChallengesList] = useState<ChallengeAssignment[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [targetCompletionDate, setTargetCompletionDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [tagsInput, setTagsInput] = useState("IoT, LoRaWAN, Water Quality, Embedded Systems");
  const [budgetAllocated, setBudgetAllocated] = useState<number>(450000);
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  // Initial Milestones builder
  const [milestones, setMilestones] = useState<
    { title: string; description: string; targetDate: string }[]
  >([
    {
      title: "Technical Specification & Sensor Bench Calibration",
      description: "Formulation of mathematical models and sensor laboratory validation.",
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
    {
      title: "Hardware Prototype Fabrication & Lab Simulation",
      description: "CAD modeling, PCB fabrication, and environmental chamber testing.",
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  ]);

  const [isLoadingLookups, setIsLoadingLookups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingLookups(true);
    Promise.all([academicService.listFaculty(), academicService.listAssignedChallenges()])
      .then(([fac, chal]) => {
        setFacultyList(fac);
        setChallengesList(chal);
        if (fac.length > 0) {
          const available = fac.find((f) => f.activeMentorshipCount < 3) || fac[0];
          setSelectedFacultyId(available.id);
        }
        if (chal.length > 0) {
          setChallengeTitle(chal[0].challengeTitle);
          setChallengeId(chal[0].challengeId);
          setCategory(chal[0].category);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingLookups(false));
  }, []);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: "",
        description: "",
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (
    index: number,
    field: "title" | "description" | "targetDate",
    value: string
  ) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !synopsis.trim() || !description.trim()) {
      setError("Please complete project title, synopsis, and detailed scope.");
      return;
    }

    const selectedFaculty = facultyList.find((f) => f.id === selectedFacultyId);
    const mentorName = selectedFaculty ? selectedFaculty.name : "Dr. Ramesh Verma";
    const mentorInstitution = selectedFaculty ? selectedFaculty.universityName : "IIT Roorkee";

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      setError(null);

      const created = await projectService.createProject({
        title: title.trim(),
        synopsis: synopsis.trim(),
        description: description.trim(),
        category,
        challengeId,
        challengeTitle,
        teamId: `team-${Date.now()}`,
        teamName: teamName.trim(),
        teamLeadName: teamLeadName.trim(),
        teamMembersCount: Number(teamMembersCount) || 4,
        facultyMentorId: selectedFacultyId || "fac-default",
        facultyMentorName: mentorName,
        facultyMentorInstitution: mentorInstitution,
        targetCompletionDate: new Date(targetCompletionDate).toISOString(),
        tags: tags.length > 0 ? tags : ["Innovation", "R&D", "Engineering"],
        budgetAllocated: Number(budgetAllocated) || 300000,
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        initialMilestones: milestones.filter((m) => m.title.trim().length > 0),
      });

      router.push(`/projects/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize project.";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Back navigation */}
        <Link
          href="/projects"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Project Registry
        </Link>

        {/* Page Header */}
        <PageHeader
          title="Initiate Innovation R&D Project"
          description="Register a new capstone research project linked to a national challenge statement, student roster, and appointed faculty mentor."
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Project Initialization Wizard
            </span>
          }
        />

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Project Identity & Synopsis */}
          <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166534]" />
              1. Project Overview & Problem Association
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                Project Title <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., IoT Groundwater Recharge & Contaminant Sensing Network"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                required
              />
            </div>

            {/* Synopsis & Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Executive Synopsis <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="One-line summary of innovation architecture..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Domain Category <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Linked Challenge Statement */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                Linked Challenge Statement <span className="text-[#DC2626]">*</span>
              </label>
              {challengesList.length > 0 ? (
                <select
                  value={challengeId}
                  onChange={(e) => {
                    const match = challengesList.find((c) => c.challengeId === e.target.value);
                    if (match) {
                      setChallengeId(match.challengeId);
                      setChallengeTitle(match.challengeTitle);
                      setCategory(match.category);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                >
                  {challengesList.map((c) => (
                    <option key={c.id} value={c.challengeId}>
                      [{c.category}] {c.challengeTitle} ({c.universityName})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A]"
                  required
                />
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A]">
                Detailed Research & Engineering Scope <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Elaborate on hardware architecture, mathematical formulations, sensor suites, and pilot deployment goals..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] resize-none"
                required
              />
            </div>
          </div>

          {/* Section 2: Team Roster & Faculty Mentor */}
          <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#166534]" />
              2. Student Team & Faculty Mentorship Allocation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Team Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Team JalShakti Alpha"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Team Leader <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={teamLeadName}
                  onChange={(e) => setTeamLeadName(e.target.value)}
                  placeholder="e.g., Aarav Sharma"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Members Count
                </label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={teamMembersCount}
                  onChange={(e) => setTeamMembersCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>
            </div>

            {/* Faculty Mentor Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#166534]" />
                  Appointed Faculty Mentor / PI
                </span>
                <span className="text-[11px] font-normal text-[#64748B]">
                  Max 3 Active Teams Cap
                </span>
              </label>

              {isLoadingLookups ? (
                <div className="flex items-center p-3 border border-[#CBD5E1] rounded-lg text-xs text-[#64748B]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 text-[#166534]" />
                  Loading faculty directory...
                </div>
              ) : (
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                  required
                >
                  <option value="" disabled>
                    -- Select Eligible Faculty Mentor --
                  </option>
                  {facultyList.map((f) => (
                    <option
                      key={f.id}
                      value={f.id}
                      disabled={f.activeMentorshipCount >= 3}
                    >
                      {f.name} ({f.designation}) · {f.departmentName} - {f.universityName} [{f.activeMentorshipCount}/3 Active]
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Section 3: Project Logistics & Budget */}
          <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#166534]" />
              3. Project Budget, Target Date & Repositories
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#166534]" />
                  Target Completion Date <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="date"
                  value={targetCompletionDate}
                  onChange={(e) => setTargetCompletionDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  R&D Grant Budget (INR ₹)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={budgetAllocated}
                  onChange={(e) => setBudgetAllocated(Number(e.target.value))}
                  placeholder="450000"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Tech Stack / Tags
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="IoT, AI/ML, CAD, Solar"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  GitHub / Git Repository (Optional)
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Live Pilot / Demo URL (Optional)
                </label>
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Milestones */}
          <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#166534]" />
                4. Initial Research Milestones & Deliverables
              </h3>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-xs font-semibold text-[#166534] hover:bg-[#EEF2F7] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((ms, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#166534] font-mono">
                      Milestone 0{idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-[#64748B] hover:text-[#DC2626] p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        Title
                      </label>
                      <input
                        type="text"
                        value={ms.title}
                        onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                        placeholder="e.g., Sensor Bench Calibration"
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={ms.targetDate}
                        onChange={(e) => handleMilestoneChange(idx, "targetDate", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-foreground">
                      Description & Deliverables Criteria
                    </label>
                    <input
                      type="text"
                      value={ms.description}
                      onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                      placeholder="Outline verification criteria..."
                      className="w-full px-3 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Submission */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/projects"
              className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#EEF2F7] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 shadow-xs flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Project...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Initialize Project Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
