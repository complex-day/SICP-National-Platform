"use client";

import React from "react";
import Link from "next/link";
import { Project } from "../types/project.types";
import { ProjectStageBadge } from "./ProjectStageBadge";
import {
  Users,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
} from "lucide-react";

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const isCompleted = project.stage === "COMPLETED";

  return (
    <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] hover:border-[#166534]/60 transition-all duration-200 shadow-xs flex flex-col justify-between group relative">
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-[#EEF2F7] text-[#475569] text-xs font-semibold">
            {project.category}
          </span>
          <ProjectStageBadge stage={project.stage} />
        </div>

        {/* Title & Synopsis */}
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="font-bold text-base text-[#0F172A] tracking-tight hover:text-[#166534] transition-colors line-clamp-1 group-hover:underline"
          >
            {project.title}
          </Link>
          <p className="text-xs text-[#475569] line-clamp-2 mt-1.5 leading-relaxed">
            {project.synopsis}
          </p>
        </div>

        {/* Challenge Link */}
        <div className="p-2.5 rounded-lg bg-[#EEF2F7] border border-[#E2E8F0] text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] block mb-0.5">
            Linked Challenge
          </span>
          <span className="font-medium text-[#0F172A] line-clamp-1">
            {project.challengeTitle}
          </span>
        </div>

        {/* Team & Mentor Meta */}
        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#166534]" />
              Team:
            </span>
            <span className="font-semibold text-[#0F172A] truncate max-w-[180px]">
              {project.teamName} ({project.teamMembersCount} members)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#166534]" />
              Faculty Mentor:
            </span>
            <span className="font-medium text-[#0F172A] truncate max-w-[180px]">
              {project.facultyMentorName}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] font-medium">Lifecycle Progress</span>
            <span className="font-mono font-bold text-[#166534]">
              {project.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#EEF2F7] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted
                  ? "bg-[#14532D]"
                  : project.progressPercentage > 60
                  ? "bg-[#166534]"
                  : "bg-[#16A34A]"
              }`}
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta & Action */}
      <div className="pt-4 border-t border-[#E2E8F0] mt-4 flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {isCompleted
              ? "Project Complete"
              : `${project.analytics.daysRemaining} days left`}
          </span>
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="px-3 py-1.5 rounded-lg bg-[#166534] text-white font-semibold text-xs hover:bg-[#14532D] shadow-xs flex items-center gap-1.5 transition-all"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
