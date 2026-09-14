"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Award,
  CheckCircle2,
  Calendar,
  LogOut,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { User } from "@/types/auth.types";

export function UserProfileCard() {
  const router = useRouter();
  const { user, accessToken, refreshToken, logout, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<User | null>(user);

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
      return;
    }

    const fetchLatestProfile = async () => {
      setIsLoading(true);
      try {
        const latest = await authService.getCurrentUser(accessToken);
        setProfile(latest);
        setUser(latest);
      } catch {
        // If token expired, logout to re-authenticate
        logout();
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestProfile();
  }, [accessToken, logout, router, setUser]);

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await authService.logout(accessToken, refreshToken);
      } catch {
        // Continue local logout
      }
    }
    logout();
    router.push("/login");
  };

  if (isLoading || !profile) {
    return (
      <div className="w-full max-w-xl p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Loading user credentials...</p>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    citizen: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    student: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    faculty: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    industry: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    government: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    admin: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  return (
    <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900/50 via-slate-900 to-indigo-900/40 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xl">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {profile.full_name}
              {profile.is_verified && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" title="Verified Account" />
              )}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  roleColors[profile.role] || "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {profile.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2.5 text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl transition duration-200"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Body Details */}
      <div className="p-6 space-y-6">
        {/* Trust Score & Metrics */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Platform Trust Score</p>
              <p className="text-lg font-bold text-white">{profile.trust_score} / 100</p>
            </div>
          </div>
          <div className="w-24 bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2.5 rounded-full"
              style={{ width: `${profile.trust_score}%` }}
            />
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account Information
          </h3>

          <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-slate-800/30 rounded-lg border border-slate-800">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-slate-800/30 rounded-lg border border-slate-800">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-slate-800/30 rounded-lg border border-slate-800">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-slate-800/30 rounded-lg border border-slate-800">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono text-xs text-slate-400">User ID: {profile.id}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => router.push("/settings")}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-slate-400" />
            <span>Account Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="py-2.5 px-5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
