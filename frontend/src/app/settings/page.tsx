"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { changePasswordSchema, ChangePasswordInput } from "@/features/auth/auth.schema";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    if (!accessToken) return;
    setIsLoading(true);
    setServerError(null);
    setIsSuccess(false);

    try {
      await authService.changePassword(accessToken, values);
      setIsSuccess(true);
      reset();
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to update password. Please check your current password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 w-full space-y-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Profile</span>
      </Link>

      <div className="p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Account Security Settings</h2>
        <p className="text-sm text-slate-400 mb-8">
          Update your authentication password to maintain account integrity.
        </p>

        {isSuccess && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-200 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Your password has been changed successfully.</span>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="current_password">
              Current Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="current_password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("current_password")}
                className={`w-full pl-11 pr-11 py-2.5 bg-slate-800/80 border ${
                  errors.current_password ? "border-red-500" : "border-slate-700"
                } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.current_password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="new_password">
              New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="new_password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("new_password")}
                className={`w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border ${
                  errors.new_password ? "border-red-500" : "border-slate-700"
                } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500`}
              />
            </div>
            {errors.new_password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="confirm_new_password">
              Confirm New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="confirm_new_password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirm_new_password")}
                className={`w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border ${
                  errors.confirm_new_password ? "border-red-500" : "border-slate-700"
                } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500`}
              />
            </div>
            {errors.confirm_new_password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.confirm_new_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
