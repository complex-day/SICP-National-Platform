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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">
                Assign Department & Research Lead
              </h3>
              <p className="text-xs text-muted-foreground">
                HEI Institutional Challenge Routing
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

          {/* Challenge Info */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 space-y-1.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Target Challenge
            </span>
            <h4 className="font-semibold text-foreground text-sm">
              {assignment.challengeTitle}
            </h4>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium">
                {assignment.category}
              </span>
              <span className="text-muted-foreground text-[11px]">
                {assignment.universityName}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-6 border border-border rounded-xl text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-primary" />
              Loading institutional records...
            </div>
          ) : (
            <>
              {/* Department Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  Select Academic Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
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
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  Select Lead Faculty / Principal Investigator
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
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
                  <p className="text-[11px] text-amber-400">
                    No faculty found specifically for this department. All university faculty will be shown.
                  </p>
                )}
              </div>

              {/* Research Directives */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Department Research Scope / Action Plan (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify R&D milestone requirements, student team intake targets, or lab allocation..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
                />
              </div>
            </>
          )}

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
              disabled={isSubmitting || isLoading || !selectedDeptId || !selectedFacultyId}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
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
