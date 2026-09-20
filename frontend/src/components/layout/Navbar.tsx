"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

const getRoleBadgeStyle = (role?: UserRole | null) => {
  switch (role) {
    case UserRole.GOVERNMENT:
      return "bg-amber-50 text-amber-800 border-amber-300";
    case UserRole.INDUSTRY:
      return "bg-purple-50 text-purple-800 border-purple-300";
    case UserRole.FACULTY:
      return "bg-sky-50 text-sky-800 border-sky-300";
    case UserRole.STUDENT:
      return "bg-emerald-50 text-emerald-800 border-emerald-300";
    case UserRole.ADMIN:
      return "bg-rose-50 text-rose-800 border-rose-300";
    default:
      return "bg-blue-50 text-[#0052CC] border-blue-200";
  }
};

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuthStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push("/login");
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems, projects, universities, districts..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-12 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0052CC] focus:bg-white transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Role, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Role Badge */}
        {isAuthenticated && role && (
          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider hidden sm:inline-flex items-center gap-1",
              getRoleBadgeStyle(role)
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
            {role}
          </span>
        )}

        {/* Notifications Popover */}
        {isAuthenticated && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#0052CC] ring-2 ring-white"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-[#0052CC] font-medium cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2 text-left max-h-60 overflow-y-auto">
                  <div className="p-2.5 rounded-md bg-slate-50 text-xs border border-slate-200">
                    <p className="font-semibold text-slate-900 text-[11px]">Challenge Claimed</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      IIT Bombay claimed your Wardha Water project for semester capstone.
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">10m ago</span>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-50 text-xs border border-slate-200">
                    <p className="font-semibold text-slate-900 text-[11px]">CSR Grant Tranche Released</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      TCS Foundation approved ₹2.5L disbursement for Milestone 1.
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">1h ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Menu */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="User Profile Menu"
            >
              <div className="h-6 w-6 rounded-full bg-[#0052CC] text-white font-bold text-xs flex items-center justify-center">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden md:inline truncate max-w-[100px]">
                {user.full_name?.split(" ")[0]}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-200 uppercase">
                      {user.role}
                    </span>
                    <span className="text-[9px] text-[#0F9D58] font-medium inline-flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Trust: {user.trust_score || 50}%
                    </span>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  href="/transparency"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Open Data Ledger</span>
                </Link>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-lg bg-[#0052CC] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

