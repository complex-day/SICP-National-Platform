"use client";

import React from "react";
import Link from "next/link";
import { Inbox, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  const ActionIcon = action?.icon || Plus;

  return (
    <div
      className={cn(
        "glass-panel rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-2 border-border/70",
        compact ? "p-6" : "p-10 sm:p-14",
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-muted/60 border border-border text-muted-foreground flex items-center justify-center mb-4",
          compact ? "h-10 w-10" : "h-14 w-14"
        )}
      >
        <Icon className={cn(compact ? "h-5 w-5" : "h-7 w-7")} />
      </div>

      <h3
        className={cn(
          "font-semibold text-foreground mb-1",
          compact ? "text-sm" : "text-base sm:text-lg"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-xs text-muted-foreground max-w-sm mb-6",
            compact ? "mb-4" : "mb-6"
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action &&
            (action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>{action.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <ActionIcon className="h-3.5 w-3.5" />
                <span>{action.label}</span>
              </button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium hover:bg-muted transition-colors"
              >
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium hover:bg-muted transition-colors"
              >
                <span>{secondaryAction.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
