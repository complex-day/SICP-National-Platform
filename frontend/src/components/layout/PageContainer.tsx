import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageContainer({
  children,
  className,
  title,
  subtitle,
  actions,
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6", className)}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-[#475569] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
