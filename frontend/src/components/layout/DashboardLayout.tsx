"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  className?: string;
}

export function DashboardLayout({
  children,
  allowedRoles,
  requireAuth = true,
  className,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const content = (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenMobileMenu={() => setIsMobileOpen(true)} />

        <main className={cn("flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );

  if (requireAuth) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        {content}
      </ProtectedRoute>
    );
  }

  return content;
}
