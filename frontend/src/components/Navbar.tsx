"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, User, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition">
              SICP
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 font-medium tracking-wider uppercase">
              Societal Innovation
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  pathname === "/dashboard"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/profile"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  pathname === "/profile"
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.full_name || "Profile"}</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  pathname === "/login"
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
