"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Building2,
  GraduationCap,
  Layers,
  Users,
  Compass,
  FileText,
  Home,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Challenges", href: "/challenges", icon: Compass },
  { label: "University", href: "/university/dashboard", icon: GraduationCap },
  { label: "Projects", href: "/university/projects", icon: Layers },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Industry", href: "/partnerships", icon: Building2 },
  { label: "Transparency", href: "/transparency", icon: ShieldCheck },
];

export function GovNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/challenges?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Emblem & Logo */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="h-10 w-10 rounded bg-[#166534] text-white flex items-center justify-center font-bold text-lg tracking-wider border border-[#14532D] shrink-0">
                SICP
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#0F172A] leading-tight tracking-tight group-hover:text-[#166534] transition-colors whitespace-nowrap">
                  SICP Jharkhand
                </span>
                <span className="text-[10px] text-[#64748B] font-medium tracking-wide whitespace-nowrap">
                  Government of Jharkhand Innovation Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 ml-4">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-5 text-sm font-medium transition-colors border-b-2 inline-flex items-center gap-1.5 whitespace-nowrap",
                      isActive
                        ? "border-[#166534] text-[#166534] font-semibold"
                        : "border-transparent text-[#475569] hover:text-[#166534] hover:border-emerald-200"
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4 shrink-0 opacity-80" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section: Search & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 xl:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search portal..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#166534] focus:bg-white transition-all"
              />
            </form>

            {/* Role Badge */}
            {isAuthenticated && role && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-[#166534] border border-emerald-200">
                {role}
              </span>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-[#E2E8F0] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-3 pt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, universities, projects..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </form>

          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-emerald-50 text-[#166534] font-semibold border-l-4 border-[#166534]"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.icon && <item.icon className="h-4 w-4 text-[#166534]" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
