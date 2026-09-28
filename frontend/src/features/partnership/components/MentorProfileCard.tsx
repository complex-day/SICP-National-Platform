"use client";

import React from "react";
import { IndustryMentor } from "../types/partnership.types";
import { Building2, Clock, FolderGit2, Mail, Sparkles, CalendarPlus } from "lucide-react";

interface MentorProfileCardProps {
  mentor: IndustryMentor;
  onBookSession?: (mentor: IndustryMentor) => void;
}

export function MentorProfileCard({ mentor, onBookSession }: MentorProfileCardProps) {
  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all group">
      <div>
        <div className="flex items-start gap-3.5 mb-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-[#166534] text-base shadow-xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#0F172A] text-base tracking-tight truncate group-hover:text-[#166534] transition-colors">
              {mentor.name}
            </h3>
            <p className="text-xs text-[#475569] truncate">{mentor.designation}</p>
            <div className="flex items-center gap-1.5 text-xs text-[#166534] mt-0.5 font-semibold truncate">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{mentor.company}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertise.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#EEF2F7] text-[#475569] border border-[#E2E8F0]"
            >
              <Sparkles className="h-2.5 w-2.5 text-[#166534]" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#E2E8F0]">
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#166534]" />
            <div>
              <div className="font-bold text-[#0F172A]">{mentor.totalHoursLogged} hrs</div>
              <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Advisory</div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] flex items-center gap-2">
            <FolderGit2 className="h-3.5 w-3.5 text-[#16A34A]" />
            <div>
              <div className="font-bold text-[#0F172A]">{mentor.assignedProjectsCount} Teams</div>
              <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Assigned</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${mentor.email}`}
            className="p-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors shrink-0"
            title={`Email ${mentor.name}`}
          >
            <Mail className="h-3.5 w-3.5" />
          </a>

          {onBookSession && (
            <button
              onClick={() => onBookSession(mentor)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#14532D] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Log Advisory Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
