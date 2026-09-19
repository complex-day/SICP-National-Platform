"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading data...",
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex flex-col items-center justify-center p-6 gap-3", className)}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {label && <p className="text-xs text-muted-foreground font-medium">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoadingSkeleton({ title = "Loading page..." }: { title?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto animate-pulse"
    >
      {/* Header skeleton */}
      <div className="space-y-2 pb-4 border-b border-border/60">
        <div className="h-4 w-28 bg-muted rounded"></div>
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="h-4 w-96 bg-muted rounded"></div>
      </div>

      {/* KPI Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel rounded-xl p-5 space-y-3">
            <div className="h-3 w-20 bg-muted rounded"></div>
            <div className="h-7 w-32 bg-muted rounded"></div>
            <div className="h-3 w-24 bg-muted rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 h-80 space-y-4">
          <div className="h-5 w-40 bg-muted rounded"></div>
          <div className="h-full bg-muted/30 rounded-lg"></div>
        </div>
        <div className="glass-panel rounded-xl p-6 h-80 space-y-4">
          <div className="h-5 w-32 bg-muted rounded"></div>
          <div className="h-full bg-muted/30 rounded-lg"></div>
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-panel rounded-xl p-4 animate-pulse space-y-3">
      <div className="h-10 bg-muted/60 rounded-lg"></div>
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-border/40 last:border-0">
          {[...Array(cols)].map((_, c) => (
            <div key={c} className="h-6 bg-muted/40 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
