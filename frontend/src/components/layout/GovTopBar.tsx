"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, User, Globe, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function GovTopBar() {
  const { user, isAuthenticated, role, logout } = useAuthStore();
  const [currentLang, setCurrentLang] = useState<"EN" | "HI">("EN");
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === "EN" ? "HI" : "EN"));
  };

  return (
    <div className="bg-[#14532D] text-white text-[12px] font-medium border-b border-[#052E16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
        {/* Left: Emblem & National Gov Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 tracking-wide">
            <span className="text-[14px]">🏛️</span>
            <span className="font-semibold hidden sm:inline">
              {currentLang === "EN" ? "Government of Jharkhand" : "झारखण्ड सरकार"}
            </span>
            <span className="text-emerald-300/60 hidden sm:inline">|</span>
            <span className="text-emerald-100 font-normal">
              {currentLang === "EN"
                ? "Department of Higher & Technical Education / IT & e-Gov"
                : "उच्च एवं तकनीकी शिक्षा विभाग | सूचना प्रौद्योगिकी"}
            </span>
          </div>
        </div>

        {/* Right: Accessibility Controls & Utilities */}
        <div className="flex items-center gap-4 text-[11px]">
          {/* Font Resizer */}
          <div className="hidden md:flex items-center gap-1 bg-[#052E16]/80 px-2 py-0.5 rounded border border-emerald-500/30">
            <button
              type="button"
              onClick={() => setFontSizeOffset(-1)}
              className="hover:text-emerald-200 transition-colors px-1"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-emerald-400/50">|</span>
            <button
              type="button"
              onClick={() => setFontSizeOffset(0)}
              className="hover:text-emerald-200 transition-colors px-1 font-bold"
              title="Standard Font Size"
            >
              A
            </button>
            <span className="text-emerald-400/50">|</span>
            <button
              type="button"
              onClick={() => setFontSizeOffset(1)}
              className="hover:text-emerald-200 transition-colors px-1"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Language Switch */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 hover:text-emerald-200 transition-colors font-semibold"
            title="Switch Language"
          >
            <Globe className="h-3 w-3" />
            <span>{currentLang === "EN" ? "हिन्दी" : "English"}</span>
          </button>

          <span className="text-emerald-300/40 hidden sm:inline">|</span>

          {/* User Auth or Quick Links */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                {role || "USER"}
              </span>
              <span className="hidden sm:inline font-medium text-emerald-100 truncate max-w-[120px]">
                {user.email || user.username}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="hover:text-emerald-200 transition-colors inline-flex items-center gap-1"
                title="Sign Out"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hover:text-emerald-200 transition-colors font-semibold"
              >
                Sign In
              </Link>
              <span className="text-emerald-300/50">/</span>
              <Link
                href="/register"
                className="hover:text-emerald-200 transition-colors font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
