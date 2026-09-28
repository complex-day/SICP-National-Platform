"use client";

import React from "react";
import { GovTopBar } from "./GovTopBar";
import { GovNavbar } from "./GovNavbar";
import { GovFooter } from "./GovFooter";
import { MobileBottomNav } from "./MobileBottomNav";
import { AlertBar } from "@/components/common/AlertBar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showBanner?: boolean;
  bannerContent?: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

export function AppShell({
  children,
  showBanner = false,
  bannerContent,
  showFooter = true,
  className,
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#212121] font-sans pb-16 lg:pb-0">
      {/* 1. Official Government Top Bar */}
      <GovTopBar />

      {/* 2. Official Horizontal Navigation */}
      <GovNavbar />

      {/* 3. Official Alert / Notice Bar */}
      {showBanner && (
        <AlertBar
          message={
            bannerContent ||
            "State Societal Innovation Ledger is active. All milestones, university approvals, and CSR funding tranches are cryptographically verifiable."
          }
          actionText="Verify Ledger"
          actionHref="/transparency"
        />
      )}

      {/* 4. Main Content Area */}
      <main className={cn("flex-1 w-full", className)}>
        {children}
      </main>

      {/* 5. Official Government Footer */}
      {showFooter && <GovFooter />}

      {/* 6. UMANG-Style Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
