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
      <div className="w-full max-w-xl p-8 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center min-h-[300px] shadow-sm">
        <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin mb-3" />
        <p className="text-slate-500 text-xs">Loading user credentials...</p>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    citizen: "bg-blue-50 text-[#0052CC] border-blue-200",
    student: "bg-emerald-50 text-emerald-800 border-emerald-300",
    faculty: "bg-purple-50 text-purple-800 border-purple-300",
    industry: "bg-amber-50 text-amber-800 border-amber-300",
    government: "bg-sky-50 text-sky-800 border-sky-300",
    admin: "bg-rose-50 text-rose-800 border-rose-300",
  };

  return (
    <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0052CC] font-bold text-xl">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {profile.full_name}
              {profile.is_verified && (
                <span title="Verified Account">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  roleColors[profile.role] || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {profile.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700">
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2.5 text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl transition duration-150 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Body Details */}
      <div className="p-6 space-y-6">
        {/* Trust Score & Metrics */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Platform Trust Score</p>
              <p className="text-lg font-bold text-slate-900">{profile.trust_score} / 100</p>
            </div>
          </div>
          <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#0052CC] h-2.5 rounded-full"
              style={{ width: `${profile.trust_score}%` }}
            />
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account Information
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-3 text-xs text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono text-xs text-slate-500">User ID: {profile.id}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => router.push("/settings")}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-slate-500" />
            <span>Account Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="py-2.5 px-5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
