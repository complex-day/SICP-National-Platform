import React from "react";
import {
  ChallengeStatus,
  ChallengeTimelineEvent,
  CHALLENGE_STATUSES,
} from "@/features/challenges/types/challenge.types";
import { CheckCircle2, Clock, CircleDot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeTimelineProps {
  currentStatus: ChallengeStatus;
  events?: ChallengeTimelineEvent[];
  className?: string;
}

const statusOrder: ChallengeStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CLAIMED",
  "IN_PROGRESS",
  "RESOLVED",
];

const statusDescriptions: Record<ChallengeStatus, string> = {
  DRAFT: "Observation recorded & initial draft prepared.",
  OPEN: "Published and open for intake & community review.",
  SUBMITTED: "Citizen verified and submitted for nodal review.",
  UNDER_REVIEW: "AI triage & district authority eligibility vetting.",
  CLAIMED: "Academic institution or research team claimed for R&D.",
  ASSIGNED: "Assigned to university engineering department.",
  MATCHED: "Matched with faculty research lead & research squad.",
  IN_PROGRESS: "Active solution prototyping and on-site field trials.",
  ACTIVE: "Active solution prototyping and on-site field trials.",
  RESOLVED: "Solution validated, deployed, and impact verified.",
  COMPLETED: "Field implementation validated & completed.",
};

export const ChallengeTimeline: React.FC<ChallengeTimelineProps> = ({
  currentStatus,
  events = [],
  className,
}) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Horizontal Progress Flow for Desktop */}
      <div className="hidden lg:block p-6 rounded-2xl glass-panel border border-border/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
          Lifecycle Progression
        </h3>
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-border -z-0" />
          {/* Active Filled Line */}
          <div
            className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500 -z-0"
            style={{
              width: `${(Math.max(0, currentIndex) / (statusOrder.length - 1)) * 100}%`,
            }}
          />

          {statusOrder.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <div key={step} className="flex flex-col items-center relative z-10 text-center max-w-[100px]">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/25 animate-pulse",
                    isPending && "bg-muted border border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <CircleDot className="h-4 w-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-semibold tracking-tight",
                    isCurrent && "text-primary font-bold",
                    isCompleted && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical Detailed Timeline Events */}
      <div className="glass-panel rounded-2xl border border-border/80 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Audit & Verification History</span>
          </h3>
          <span className="text-xs font-medium text-muted-foreground">
            {events.length} logged event{events.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {events.map((event, idx) => {
            const isLatest = idx === events.length - 1;
            return (
              <div key={event.id || idx} className="relative group">
                {/* Event Marker */}
                <div
                  className={cn(
                    "absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-background transition-all",
                    isLatest
                      ? "border-primary ring-4 ring-primary/20 bg-primary"
                      : "border-muted-foreground/60 group-hover:border-primary"
                  )}
                />

                <div className="bg-background/50 border border-border/70 rounded-xl p-4 space-y-1.5 hover:border-border transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{event.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-semibold uppercase">
                        {event.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {event.author && (
                    <div className="text-[11px] text-muted-foreground/80 pt-1 flex items-center gap-1.5">
                      <span>Logged by:</span>
                      <strong className="text-foreground/90 font-medium">{event.author}</strong>
                      {event.role && (
                        <span className="text-primary font-medium">({event.role})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="text-xs text-muted-foreground italic py-2">
              No detailed timeline notes logged for this challenge yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
