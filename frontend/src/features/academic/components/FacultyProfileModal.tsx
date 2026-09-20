"use client";

import React from "react";
import { Faculty } from "../types/academic.types";
import { FacultyAvailabilityBadge } from "./FacultyAvailabilityBadge";
import {
  X,
  GraduationCap,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Mail,
  Building2,
  FileCheck2,
  Activity,
  Calendar,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  faculty: Faculty | null;
  onAssignMentor?: (faculty: Faculty) => void;
}

export function FacultyProfileModal({
  isOpen,
  onClose,
  faculty,
  onAssignMentor,
}: Props) {
  if (!isOpen || !faculty) return null;

  const isAtCapacity = faculty.activeMentorshipCount >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative px-6 py-6 border-b border-border bg-gradient-to-r from-primary/10 via-background to-brand-700/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-brand-700 flex items-center justify-center text-primary-foreground font-black text-2xl shadow-glow">
              {faculty.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-xl text-foreground tracking-tight">
                  {faculty.name}
                </h3>
                <FacultyAvailabilityBadge
                  availability={faculty.availability}
                  activeCount={faculty.activeMentorshipCount}
                  showCount
                />
              </div>
              <p className="text-sm font-medium text-primary">
                {faculty.designation} · {faculty.departmentName}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {faculty.universityName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col items-center text-center">
              <span className="text-[11px] font-medium text-muted-foreground">
                H-Index
              </span>
              <span className="text-xl font-bold text-foreground font-mono mt-1">
                {faculty.hIndex || 18}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium mt-0.5">
                High Impact
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col items-center text-center">
              <span className="text-[11px] font-medium text-muted-foreground">
                Patents Filed
              </span>
              <span className="text-xl font-bold text-foreground font-mono mt-1">
                {faculty.patentsCount || 4}
              </span>
              <span className="text-[10px] text-primary font-medium mt-0.5">
                IP Protected
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col items-center text-center">
              <span className="text-[11px] font-medium text-muted-foreground">
                Success Rate
              </span>
              <span className="text-xl font-bold text-foreground font-mono mt-1">
                {faculty.successRate || 92}%
              </span>
              <span className="text-[10px] text-cyan-400 font-medium mt-0.5">
                Pilot Completion
              </span>
            </div>
          </div>

          {/* Mentorship Workload Status */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-primary" />
                Active Mentorship Workload Constraint
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isAtCapacity ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {faculty.activeMentorshipCount} / 3 Teams Assigned
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  faculty.activeMentorshipCount === 1
                    ? "w-1/3 bg-emerald-500"
                    : faculty.activeMentorshipCount === 2
                    ? "w-2/3 bg-amber-500"
                    : "w-full bg-rose-500"
                }`}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isAtCapacity
                ? "This faculty mentor has reached the statutory HEI capacity threshold (max 3 concurrent student teams). Assigning additional teams is locked."
                : `Faculty mentor has ${3 - faculty.activeMentorshipCount} available mentorship slot(s) for the current academic cycle.`}
            </p>
          </div>

          {/* Specializations & Core Competencies */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Specializations & Domain Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {faculty.specializations.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Research Experience & Publications */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Institutional Affiliation & Contact
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Official Email:
                </span>
                <span className="font-mono text-foreground font-medium">
                  {faculty.email}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Faculty ID:
                </span>
                <span className="font-mono text-foreground font-medium">
                  {faculty.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            Close
          </button>

          {onAssignMentor && (
            <button
              onClick={() => {
                onClose();
                onAssignMentor(faculty);
              }}
              disabled={isAtCapacity}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAtCapacity ? "Mentorship Full (3/3)" : "Assign as Mentor"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
