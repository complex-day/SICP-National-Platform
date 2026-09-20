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
    <div className="glass-panel p-5 rounded-xl border border-border flex flex-col justify-between hover:border-primary/40 transition-all group">
      <div>
        <div className="flex items-start gap-3.5 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center font-bold text-primary text-base shadow-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-base tracking-tight truncate group-hover:text-primary transition-colors">
              {mentor.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{mentor.designation}</p>
            <div className="flex items-center gap-1.5 text-xs text-primary/90 mt-0.5 font-medium truncate">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{mentor.company}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertise.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/60"
            >
              <Sparkles className="h-2.5 w-2.5 text-primary/70" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-border/70">
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-muted/40 p-2 rounded-lg border border-border/40 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <div>
              <div className="font-bold text-foreground">{mentor.totalHoursLogged} hrs</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Advisory</div>
            </div>
          </div>

          <div className="bg-muted/40 p-2 rounded-lg border border-border/40 flex items-center gap-2">
            <FolderGit2 className="h-3.5 w-3.5 text-emerald-500" />
            <div>
              <div className="font-bold text-foreground">{mentor.assignedProjectsCount} Teams</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Assigned</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${mentor.email}`}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={`Email ${mentor.name}`}
          >
            <Mail className="h-3.5 w-3.5" />
          </a>

          {onBookSession && (
            <button
              onClick={() => onBookSession(mentor)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
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
