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
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between group relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold">
            {project.category}
          </span>
          <ProjectStageBadge stage={project.stage} />
        </div>

        {/* Title & Synopsis */}
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="font-bold text-base text-foreground tracking-tight hover:text-primary transition-colors line-clamp-1 group-hover:underline"
          >
            {project.title}
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
            {project.synopsis}
          </p>
        </div>

        {/* Challenge Link */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
            Linked Challenge
          </span>
          <span className="font-medium text-foreground line-clamp-1">
            {project.challengeTitle}
          </span>
        </div>

        {/* Team & Mentor Meta */}
        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              Team:
            </span>
            <span className="font-semibold text-foreground truncate max-w-[180px]">
              {project.teamName} ({project.teamMembersCount} members)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              Faculty Mentor:
            </span>
            <span className="font-medium text-foreground truncate max-w-[180px]">
              {project.facultyMentorName}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Lifecycle Progress</span>
            <span className="font-mono font-bold text-primary">
              {project.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted
                  ? "bg-emerald-500"
                  : project.progressPercentage > 60
                  ? "bg-purple-500"
                  : "bg-primary"
              }`}
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta & Action */}
      <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-muted-foreground">
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
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-glow-sm flex items-center gap-1.5 transition-all"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
