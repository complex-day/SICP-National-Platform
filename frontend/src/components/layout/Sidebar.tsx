"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Flag,
  Users,
  GraduationCap,
  Briefcase,
  Landmark,
  ShieldCheck,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Layers,
  BarChart3,
  Award,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badge?: string;
  isExternal?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { role, user } = useAuthStore();

  const navSections: NavSection[] = [
    {
      title: "Core",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Citizen Engagement",
      items: [
        {
          label: "Explore Challenges",
          href: "/challenges",
          icon: Globe2,
        },
        {
          label: "Report Issue",
          href: "/citizen/create-challenge",
          icon: Flag,
          roles: [UserRole.CITIZEN, UserRole.ADMIN],
        },
        {
          label: "My Reports",
          href: "/citizen/my-challenges",
          icon: Layers,
          roles: [UserRole.CITIZEN, UserRole.ADMIN],
        },
      ],
    },
    {
      title: "Innovation & Teams",
      items: [
        {
          label: "Teams & Roster",
          href: "/teams",
          icon: Users,
          roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN],
        },
        {
          label: "Projects & Milestones",
          href: "/projects",
          icon: Award,
          roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.INDUSTRY, UserRole.ADMIN],
        },
      ],
    },
    {
      title: "Academic Hub",
      items: [
        {
          label: "Academic Intakes",
          href: "/academic",
          icon: GraduationCap,
          roles: [UserRole.FACULTY, UserRole.ADMIN],
        },
      ],
    },
    {
      title: "Industry & CSR",
      items: [
        {
          label: "CSR Partnerships",
          href: "/partnerships",
          icon: Briefcase,
          roles: [UserRole.INDUSTRY, UserRole.GOVERNMENT, UserRole.ADMIN],
        },
      ],
    },
    {
      title: "Governance & Intelligence",
      items: [
        {
          label: "Government Command",
          href: "/governance",
          icon: Landmark,
          roles: [UserRole.GOVERNMENT, UserRole.ADMIN],
        },
        {
          label: "Public Transparency",
          href: "/transparency",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  // Filter items based on active role
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.roles) return true;
        if (!role) return false;
        if (role === UserRole.ADMIN) return true;
        return item.roles.includes(role);
      }),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 transition-opacity",
            isCollapsed ? "justify-center w-full" : ""
          )}
          onClick={onCloseMobile}
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-brand-700 flex items-center justify-center text-primary-foreground font-black text-base shadow-glow-sm shrink-0">
            🇮🇳
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1.5">
                SICP Portal
                <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                  SIH 26043
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                Govt of India · Innovation Hub
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-6">
        {filteredSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && section.title && (
              <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                {section.title}
              </h4>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed ? "justify-center px-0 py-2.5" : ""
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary border border-primary/20"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer (Desktop only) */}
      <div className="hidden lg:flex items-center justify-between p-3 border-t border-border shrink-0 bg-muted/20">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Online (v8.0.0)</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mx-auto"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={cn(
          "hidden lg:block h-screen sticky top-0 transition-all duration-300 z-30 shrink-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
