"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { loginSchema, LoginInput } from "./auth.schema";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await authService.login(values);
      setAuth(response);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to sign in. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-blue-500/5">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-2">
          Sign in to your SICP account to collaborate on societal solutions
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-800/80 rounded-xl flex items-center gap-3 text-red-200 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="rahul@example.com"
              {...register("email")}
              className={`w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border ${
                errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-blue-500"
              } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition duration-200`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-slate-300" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full pl-11 pr-11 py-2.5 bg-slate-800/80 border ${
                errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-blue-500"
              } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition">
          Register now
        </Link>
      </div>
    </div>
  );
}
