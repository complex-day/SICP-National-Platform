"use client";

import React from "react";
import { GovTopBar } from "./GovTopBar";
import { GovNavbar } from "./GovNavbar";
import { GovFooter } from "./GovFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { AlertBar } from "@/components/common/AlertBar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  className?: string;
  showNotice?: boolean;
  noticeText?: string;
}

export function DashboardLayout({
  children,
  allowedRoles,
  requireAuth = true,
  className,
  showNotice = false,
  noticeText,
}: DashboardLayoutProps) {
  const content = (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#212121] font-sans pb-16 lg:pb-0">
      {/* 1. Official Government Top Bar */}
      <GovTopBar />

      {/* 2. Official Horizontal Navigation */}
      <GovNavbar />

      {/* 3. Official Government Alert Bar */}
      {showNotice && (
        <AlertBar
          message={
            noticeText ||
            "SICP State Innovation Ledger: Citizen challenges, university allocations, and CSR funding tranches are cryptographically verifiable."
          }
          actionText="View Ledger"
          actionHref="/transparency"
        />
      )}

      {/* 4. Main Page Container */}
      <main className={cn("flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6", className)}>
        {children}
      </main>

      {/* 5. Official Government Footer */}
      <GovFooter />

      {/* 6. UMANG-Style Mobile Bottom Navigation */}
      <MobileBottomNav />
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
