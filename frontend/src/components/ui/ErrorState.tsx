"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  details?: Record<string, any> | string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message = "An unexpected error occurred while communicating with the platform API.",
  code,
  details,
  onRetry,
  showHomeButton = true,
  className,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      role="alert"
      className={cn(
        "glass-panel rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center max-w-lg mx-auto border-destructive/30 bg-destructive/5",
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>

      {code && (
        <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30 mb-2">
          {code}
        </span>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-md">
        {message}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap justify-center mb-4">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        )}

        {showHomeButton && (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium hover:bg-muted transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        )}
      </div>

      {/* Optional Technical Details */}
      {details && (
        <div className="w-full mt-2 pt-3 border-t border-destructive/20 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center justify-between w-full text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            <span>Technical details</span>
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3 rounded-lg bg-black/40 text-[10px] text-muted-foreground font-mono overflow-x-auto max-h-40 whitespace-pre-wrap">
              {typeof details === "string" ? details : JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
