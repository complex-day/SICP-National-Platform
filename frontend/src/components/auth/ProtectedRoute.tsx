"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/auth.types";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, role } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check client storage hydration
    const token = typeof window !== "undefined" ? localStorage.getItem("sicp_access_token") : null;

    if (requireAuth && !token) {
      const redirectUrl = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?redirect=${redirectUrl}`);
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, requireAuth, router, pathname]);

  if (!isReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Authenticating session..." />
      </div>
    );
  }

  // If role restricted
  if (allowedRoles && role && !allowedRoles.includes(role) && role !== UserRole.ADMIN) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-md text-center border-amber-500/30 bg-amber-500/5">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2 inline-block">
            Access Restricted
          </span>
          <h2 className="text-lg font-bold text-foreground mb-1">Unauthorized Role</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Your current profile role (<strong>{role}</strong>) does not have permission to access this module.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
