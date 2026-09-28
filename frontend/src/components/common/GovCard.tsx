import React from "react";
import { cn } from "@/lib/utils";

export interface GovCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function GovCard({
  children,
  className,
  hoverable = false,
  ...props
}: GovCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-5 transition-colors",
        hoverable && "hover:border-[#166534]/50 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GovCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b border-[#E2E8F0] pb-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GovCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold text-[#0F172A] tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function GovCardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-[#64748B] mt-0.5", className)}>
      {children}
    </p>
  );
}

export function GovCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-sm text-[#475569] leading-relaxed", className)}>
      {children}
    </div>
  );
}

export function GovCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-t border-[#E2E8F0] pt-3 mt-4 flex items-center justify-between text-xs text-[#64748B]",
        className
      )}
    >
      {children}
    </div>
  );
}
