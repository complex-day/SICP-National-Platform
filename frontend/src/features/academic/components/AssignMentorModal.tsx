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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                Assign Faculty Mentor
              </h3>
              <p className="text-xs text-[#475569]">
                HEI Institutional Mentorship Allocation & Workload Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Context Details */}
          <div className="p-3.5 rounded-lg bg-[#EEF2F7] border border-[#E2E8F0] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#475569]">Target Team:</span>
              <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#166534]" />
                {teamName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#475569]">Challenge Domain:</span>
              <span className="font-medium text-[#0F172A] truncate max-w-[280px]">
                {challengeTitle}
              </span>
            </div>
          </div>

          {/* Faculty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0F172A] flex items-center justify-between">
              <span>Select Faculty Member</span>
              <span className="text-[11px] font-normal text-[#64748B]">
                Workload Cap: Max 3 Teams
              </span>
            </label>

            {isLoading ? (
              <div className="flex items-center justify-center p-4 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B]">
                <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#166534]" />
                Loading faculty directory...
              </div>
            ) : (
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] transition-colors"
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
              className={`p-4 rounded-lg border transition-all ${
                isAtCapacity
                  ? "bg-rose-50 border-rose-300"
                  : "bg-[#F8FAFC] border-[#E2E8F0] shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-sm text-[#0F172A]">
                    {currentSelectedFaculty.name}
                  </h4>
                  <p className="text-xs text-[#475569]">
                    {currentSelectedFaculty.designation} · {currentSelectedFaculty.departmentName}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
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
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#EEF2F7] text-[#475569] font-medium border border-[#E2E8F0]"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Mentorship Capacity Progress Bar */}
              <div className="mt-3.5 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#64748B]">Mentorship Workload:</span>
                  <span
                    className={`font-semibold font-mono ${
                      isAtCapacity ? "text-rose-600" : "text-[#0F172A]"
                    }`}
                  >
                    {currentSelectedFaculty.activeMentorshipCount} / 3 Assigned
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentSelectedFaculty.activeMentorshipCount === 1
                        ? "w-1/3 bg-[#16A34A]"
                        : currentSelectedFaculty.activeMentorshipCount === 2
                        ? "w-2/3 bg-amber-500"
                        : "w-full bg-rose-500"
                    }`}
                  />
                </div>
              </div>

              {isAtCapacity && (
                <div className="mt-3 flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    Constraint Violated: Max capacity (3) reached. You cannot assign this mentor.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mentorship Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0F172A]">
              Mentorship Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("PRIMARY_MENTOR")}
                className={`px-3.5 py-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedRole === "PRIMARY_MENTOR"
                    ? "bg-emerald-50 border-[#166534] text-[#166534] shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
                }`}
              >
                <div>
                  <div className="font-semibold text-[#0F172A]">Primary Mentor</div>
                  <div className="text-[10px] text-[#64748B]">
                    Lead academic guidance
                  </div>
                </div>
                {selectedRole === "PRIMARY_MENTOR" && (
                  <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("CO_MENTOR")}
                className={`px-3.5 py-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedRole === "CO_MENTOR"
                    ? "bg-emerald-50 border-[#166534] text-[#166534] shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
                }`}
              >
                <div>
                  <div className="font-semibold text-[#0F172A]">Co-Mentor</div>
                  <div className="text-[10px] text-[#64748B]">
                    Domain specialist
                  </div>
                </div>
                {selectedRole === "CO_MENTOR" && (
                  <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                )}
              </button>
            </div>
          </div>

          {/* Special Instructions / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0F172A]">
              Allocation Directives & Lab Access (Optional)
            </label>
            <textarea
              value={mentorshipNotes}
              onChange={(e) => setMentorshipNotes(e.target.value)}
              placeholder="e.g., Provide access to IoT & Embedded Systems Lab for sensor calibration..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFacultyId || isAtCapacity}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 transition-all cursor-pointer"
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
