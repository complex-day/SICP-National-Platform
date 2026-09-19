"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Moon,
  Sun,
  Laptop,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/providers/ThemeProvider";
import { UserRole } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

const getRoleBadgeStyle = (role?: UserRole | null) => {
  switch (role) {
    case UserRole.GOVERNMENT:
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case UserRole.INDUSTRY:
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    case UserRole.FACULTY:
      return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
    case UserRole.STUDENT:
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case UserRole.ADMIN:
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    default:
      return "bg-primary/15 text-primary border-primary/30";
  }
};

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    router.push("/login");
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search problems, projects, universities, districts..."
            className="w-full bg-muted/40 border border-border/80 rounded-lg pl-9 pr-12 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground/80 bg-background border border-border px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Role, Theme, Notifications, Profile */}
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

        {/* Theme Selector Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsThemeOpen(!isThemeOpen);
              setIsProfileOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : theme === "light" ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Laptop className="h-4 w-4" />
            )}
          </button>

          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-36 glass-panel rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  setIsThemeOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors",
                  theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                )}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  setIsThemeOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors",
                  theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                )}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme("system");
                  setIsThemeOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors",
                  theme === "system" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                )}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>System</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        {isAuthenticated && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
                setIsThemeOpen(false);
              }}
              className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-xl p-3 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2 text-left max-h-60 overflow-y-auto">
                  <div className="p-2 rounded-lg bg-muted/40 text-xs border border-border/60">
                    <p className="font-semibold text-foreground text-[11px]">Challenge Claimed</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      IIT Bombay claimed your Wardha Water project for semester capstone.
                    </p>
                    <span className="text-[9px] text-muted-foreground/60 mt-1 block">10m ago</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20 text-xs border border-border/40">
                    <p className="font-semibold text-foreground text-[11px]">CSR Grant Tranche Released</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      TCS Foundation approved ₹2.5L disbursement for Milestone 1.
                    </p>
                    <span className="text-[9px] text-muted-foreground/60 mt-1 block">1h ago</span>
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
                setIsThemeOpen(false);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
              aria-label="User Profile Menu"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-primary to-cyan-500 text-primary-foreground font-bold text-xs flex items-center justify-center">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <span className="text-xs font-semibold text-foreground hidden md:inline truncate max-w-[100px]">
                {user.full_name?.split(" ")[0]}
              </span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-2 border-b border-border mb-1.5">
                  <p className="text-xs font-bold text-foreground truncate">{user.full_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                      {user.role}
                    </span>
                    <span className="text-[9px] text-emerald-500 font-medium inline-flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Trust: {user.trust_score || 50}%
                    </span>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  href="/transparency"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span>Open Data Ledger</span>
                </Link>

                <div className="border-t border-border my-1"></div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left"
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
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
