"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Sparkles, ArrowRight } from "lucide-react";
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
  showBanner = true,
  bannerContent,
  showFooter = true,
  className,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Optional GovTech Announcement Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-primary via-brand-600 to-indigo-700 text-white text-[11px] font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
          {bannerContent || (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse shrink-0" />
              <span>
                <strong>SIH 26043 Grand Finale:</strong> Empowering citizens, academia, and industry through open-data governance.
              </span>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-amber-200 transition-colors ml-1 font-semibold"
              >
                <span>Verify Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>
      )}

      {/* Header / Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className={cn("flex-1 w-full", className)}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
