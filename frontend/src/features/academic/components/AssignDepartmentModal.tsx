"use client";

import React, { useState, useEffect } from "react";
import { Department, Faculty, ChallengeAssignment } from "../types/academic.types";
import { academicService } from "@/services/academic.service";
import {
  X,
  Building2,
  GraduationCap,
  FlaskConical,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  assignment: ChallengeAssignment | null;
}

export function AssignDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  assignment,
}: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && assignment) {
      setError(null);
      setIsLoading(true);
      Promise.all([academicService.listDepartments(), academicService.listFaculty()])
        .then(([depts, fac]) => {
          setDepartments(depts);
          setFacultyList(fac);
          if (assignment.departmentId) {
            setSelectedDeptId(assignment.departmentId);
          } else if (depts.length > 0) {
            setSelectedDeptId(depts[0].id);
          }
          if (assignment.leadFacultyId) {
            setSelectedFacultyId(assignment.leadFacultyId);
          }
        })
        .catch((err) => {
          setError("Failed to load department or faculty list.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, assignment]);

  // Filter faculty by selected department
  const filteredFaculty = selectedDeptId
    ? facultyList.filter((f) => f.departmentId === selectedDeptId)
    : facultyList;

  // Auto pick first available faculty if current selection doesn't match dept
  useEffect(() => {
    if (selectedDeptId && filteredFaculty.length > 0) {
      const match = filteredFaculty.find((f) => f.id === selectedFacultyId);
      if (!match) {
        setSelectedFacultyId(filteredFaculty[0].id);
      }
    }
  }, [selectedDeptId, filteredFaculty, selectedFacultyId]);

  if (!isOpen || !assignment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId || !selectedFacultyId) {
      setError("Please select both a Department and Lead Faculty.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await academicService.assignDepartment(
        assignment.id,
        selectedDeptId,
        selectedFacultyId
      );
      onSuccess(
        `Challenge "${assignment.challengeTitle}" assigned to Department successfully.`
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign department.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F172A] text-base">
                Assign Department & Research Lead
              </h3>
              <p className="text-xs text-[#475569]">
                HEI Institutional Challenge Routing
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

          {/* Challenge Info */}
          <div className="p-3.5 rounded-lg bg-[#EEF2F7] border border-[#E2E8F0] space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              Target Challenge
            </span>
            <h4 className="font-semibold text-[#0F172A] text-sm">
              {assignment.challengeTitle}
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-white text-[#475569] border border-[#E2E8F0] text-[10px] font-medium">
                {assignment.category}
              </span>
              <span className="text-[#64748B] text-[11px]">
                {assignment.universityName}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-6 border border-[#E2E8F0] rounded-lg text-xs text-[#64748B]">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#166534]" />
              Loading institutional records...
            </div>
          ) : (
            <>
              {/* Department Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#166534]" />
                  Select Academic Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] transition-colors"
                  required
                >
                  <option value="" disabled>
                    -- Choose Department --
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code}) - {d.activeProjectsCount} Active Projects
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Faculty Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#166534]" />
                  Select Lead Faculty / Principal Investigator
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] transition-colors"
                  required
                >
                  <option value="" disabled>
                    -- Choose Lead Faculty --
                  </option>
                  {filteredFaculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation}) - Mentorships: {f.activeMentorshipCount}/3
                    </option>
                  ))}
                </select>
                {filteredFaculty.length === 0 && (
                  <p className="text-[11px] text-amber-600">
                    No faculty found specifically for this department. All university faculty will be shown.
                  </p>
                )}
              </div>

              {/* Research Directives */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0F172A]">
                  Department Research Scope / Action Plan (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify R&D milestone requirements, student team intake targets, or lab allocation..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#166534] focus:border-[#166534] transition-colors resize-none"
                />
              </div>
            </>
          )}

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
              disabled={isSubmitting || isLoading || !selectedDeptId || !selectedFacultyId}
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Routing Challenge...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Assign Department
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
