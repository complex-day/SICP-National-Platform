"use client";

import React, { useState, useEffect } from "react";
import { Faculty } from "../types/academic.types";
import { academicService } from "@/services/academic.service";
import { FacultyAvailabilityBadge } from "./FacultyAvailabilityBadge";
import {
  X,
  GraduationCap,
  Users,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  preselectedFaculty?: Faculty | null;
  facultyList?: Faculty[];
  challengeTitle?: string;
  teamName?: string;
}

export function AssignMentorModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedFaculty,
  facultyList: initialFacultyList,
  challengeTitle = "National Innovation Challenge Pilot",
  teamName = "Team JalShakti Alpha",
}: Props) {
  const [facultyList, setFacultyList] = useState<Faculty[]>(initialFacultyList || []);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"PRIMARY_MENTOR" | "CO_MENTOR">(
    "PRIMARY_MENTOR"
  );
  const [mentorshipNotes, setMentorshipNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (preselectedFaculty) {
        setSelectedFacultyId(preselectedFaculty.id);
      }
      if (!initialFacultyList || initialFacultyList.length === 0) {
        setIsLoading(true);
        academicService
          .listFaculty()
          .then((res) => {
            setFacultyList(res);
            if (!preselectedFaculty && res.length > 0) {
              const available = res.find((f) => f.activeMentorshipCount < 3);
              if (available) setSelectedFacultyId(available.id);
            }
          })
          .catch((err) => {
            setError("Failed to load faculty directory.");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [isOpen, preselectedFaculty, initialFacultyList]);

  if (!isOpen) return null;

  const currentSelectedFaculty = facultyList.find((f) => f.id === selectedFacultyId);
  const isAtCapacity =
    currentSelectedFaculty && currentSelectedFaculty.activeMentorshipCount >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyId) {
      setError("Please select a faculty mentor.");
      return;
    }

    if (isAtCapacity) {
      setError(
        `${currentSelectedFaculty?.name} has reached maximum mentorship capacity (3/3). Please choose an available faculty.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await academicService.assignMentor(
        selectedFacultyId,
        `team-${Date.now()}`,
        `chal-${Date.now()}`
      );
      onSuccess(res.message);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign faculty mentor.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Assign Faculty Mentor
              </h3>
              <p className="text-xs text-muted-foreground">
                HEI Institutional Mentorship Allocation & Workload Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Context Details */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Target Team:</span>
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                {teamName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Challenge Domain:</span>
              <span className="font-medium text-foreground truncate max-w-[280px]">
                {challengeTitle}
              </span>
            </div>
          </div>

          {/* Faculty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Select Faculty Member</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Workload Cap: Max 3 Teams
              </span>
            </label>

            {isLoading ? (
              <div className="flex items-center justify-center p-4 border border-border rounded-xl text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-primary" />
                Loading faculty directory...
              </div>
            ) : (
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
                required
              >
                <option value="" disabled>
                  -- Choose Faculty Member --
                </option>
                {facultyList.map((f) => (
                  <option
                    key={f.id}
                    value={f.id}
                    disabled={f.activeMentorshipCount >= 3}
                  >
                    {f.name} ({f.designation}) - {f.departmentName} [{f.activeMentorshipCount}/3 Active] {f.activeMentorshipCount >= 3 ? "(FULL)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Faculty Details Card */}
          {currentSelectedFaculty && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isAtCapacity
                  ? "bg-rose-500/5 border-rose-500/30"
                  : "bg-card border-border shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">
                    {currentSelectedFaculty.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {currentSelectedFaculty.designation} · {currentSelectedFaculty.departmentName}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    {currentSelectedFaculty.universityName}
                  </p>
                </div>
                <FacultyAvailabilityBadge
                  availability={currentSelectedFaculty.availability}
                  activeCount={currentSelectedFaculty.activeMentorshipCount}
                  showCount
                />
              </div>

              {/* Specializations */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentSelectedFaculty.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Mentorship Capacity Progress Bar */}
              <div className="mt-3.5 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Mentorship Workload:</span>
                  <span
                    className={`font-semibold font-mono ${
                      isAtCapacity ? "text-rose-400" : "text-foreground"
                    }`}
                  >
                    {currentSelectedFaculty.activeMentorshipCount} / 3 Assigned
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentSelectedFaculty.activeMentorshipCount === 1
                        ? "w-1/3 bg-emerald-500"
                        : currentSelectedFaculty.activeMentorshipCount === 2
                        ? "w-2/3 bg-amber-500"
                        : "w-full bg-rose-500"
                    }`}
                  />
                </div>
              </div>

              {isAtCapacity && (
                <div className="mt-3 flex items-center gap-2 text-xs text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Constraint Violated: Max capacity (3) reached. You cannot assign this mentor.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mentorship Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Mentorship Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("PRIMARY_MENTOR")}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                  selectedRole === "PRIMARY_MENTOR"
                    ? "bg-primary/10 border-primary text-primary shadow-glow-sm"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <div>
                  <div className="font-semibold text-foreground">Primary Mentor</div>
                  <div className="text-[10px] text-muted-foreground">
                    Lead academic guidance
                  </div>
                </div>
                {selectedRole === "PRIMARY_MENTOR" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("CO_MENTOR")}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                  selectedRole === "CO_MENTOR"
                    ? "bg-primary/10 border-primary text-primary shadow-glow-sm"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <div>
                  <div className="font-semibold text-foreground">Co-Mentor</div>
                  <div className="text-[10px] text-muted-foreground">
                    Domain specialist
                  </div>
                </div>
                {selectedRole === "CO_MENTOR" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Special Instructions / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Allocation Directives & Lab Access (Optional)
            </label>
            <textarea
              value={mentorshipNotes}
              onChange={(e) => setMentorshipNotes(e.target.value)}
              placeholder="e.g., Provide access to IoT & Embedded Systems Lab for sensor calibration..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFacultyId || isAtCapacity}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Assigning Mentor...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Confirm Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
