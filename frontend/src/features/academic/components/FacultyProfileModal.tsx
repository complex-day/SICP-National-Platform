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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative px-6 py-6 border-b border-[#E2E8F0] bg-[#EEF2F7]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#166534] flex items-center justify-center text-white font-bold text-2xl shadow-xs">
              {faculty.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-xl text-[#0F172A] tracking-tight">
                  {faculty.name}
                </h3>
                <FacultyAvailabilityBadge
                  availability={faculty.availability}
                  activeCount={faculty.activeMentorshipCount}
                  showCount
                />
              </div>
              <p className="text-sm font-semibold text-[#166534]">
                {faculty.designation} · {faculty.departmentName}
              </p>
              <p className="text-xs text-[#475569] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                {faculty.universityName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center text-center">
              <span className="text-[11px] font-medium text-[#64748B]">
                H-Index
              </span>
              <span className="text-xl font-bold text-[#0F172A] font-mono mt-1">
                {faculty.hIndex || 18}
              </span>
              <span className="text-[10px] text-[#16A34A] font-medium mt-0.5">
                High Impact
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center text-center">
              <span className="text-[11px] font-medium text-[#64748B]">
                Patents Filed
              </span>
              <span className="text-xl font-bold text-[#0F172A] font-mono mt-1">
                {faculty.patentsCount || 4}
              </span>
              <span className="text-[10px] text-[#166534] font-medium mt-0.5">
                IP Protected
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center text-center">
              <span className="text-[11px] font-medium text-[#64748B]">
                Success Rate
              </span>
              <span className="text-xl font-bold text-[#0F172A] font-mono mt-1">
                {faculty.successRate || 92}%
              </span>
              <span className="text-[10px] text-[#0369A1] font-medium mt-0.5">
                Pilot Completion
              </span>
            </div>
          </div>

          {/* Mentorship Workload Status */}
          <div className="p-4 rounded-lg bg-[#EEF2F7] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#166534]" />
                Active Mentorship Workload Constraint
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isAtCapacity ? "text-rose-600" : "text-[#16A34A]"
                }`}
              >
                {faculty.activeMentorshipCount} / 3 Teams Assigned
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  faculty.activeMentorshipCount === 1
                    ? "w-1/3 bg-[#16A34A]"
                    : faculty.activeMentorshipCount === 2
                    ? "w-2/3 bg-amber-500"
                    : "w-full bg-rose-500"
                }`}
              />
            </div>
            <p className="text-[11px] text-[#475569]">
              {isAtCapacity
                ? "This faculty mentor has reached the statutory HEI capacity threshold (max 3 concurrent student teams). Assigning additional teams is locked."
                : `Faculty mentor has ${3 - faculty.activeMentorshipCount} available mentorship slot(s) for the current academic cycle.`}
            </p>
          </div>

          {/* Specializations & Core Competencies */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Specializations & Domain Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {faculty.specializations.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-emerald-50 text-[#166534] border border-emerald-200 text-xs font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Research Experience & Publications */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Institutional Affiliation & Contact
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#475569] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                  Official Email:
                </span>
                <span className="font-mono text-[#0F172A] font-medium">
                  {faculty.email}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[#475569] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                  Faculty ID:
                </span>
                <span className="font-mono text-[#0F172A] font-medium">
                  {faculty.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-[#EEF2F7]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
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
              className="px-5 py-2 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center gap-2 transition-all cursor-pointer"
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
