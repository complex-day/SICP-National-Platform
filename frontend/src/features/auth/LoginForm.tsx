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
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
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

  const handleQuickLogin = async (role: "citizen" | "student" | "faculty" | "industry" | "government" | "admin", email: string, name: string) => {
    setActivePreset(role);
    setIsLoading(true);
    setServerError(null);
    setValue("email", email);
    setValue("password", "Password@123");

    try {
      const response = await authService.login({ email, password: "Password@123" });
      // Ensure the chosen role and name are explicitly honored
      const sessionData = {
        ...response,
        role,
        full_name: name,
        email,
      };
      setAuth(sessionData);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Demo login encountered an issue.");
      }
    } finally {
      setIsLoading(false);
      setActivePreset(null);
    }
  };

  const demoRoles = [
    {
      role: "citizen" as const,
      label: "Citizen",
      email: "citizen@sicp.gov.in",
      name: "Rahul Verma (Citizen)",
      color: "bg-emerald-50 border-emerald-300 hover:border-emerald-500 text-emerald-900",
      desc: "Post & track civic challenges",
    },
    {
      role: "student" as const,
      label: "Student Lead",
      email: "student@iitd.ac.in",
      name: "Aarav Sharma (IIT Delhi)",
      color: "bg-blue-50 border-blue-300 hover:border-blue-500 text-blue-900",
      desc: "Form teams & build solutions",
    },
    {
      role: "faculty" as const,
      label: "Faculty Mentor",
      email: "prof.mehta@iitb.ac.in",
      name: "Dr. Rajesh Mehta (PI)",
      color: "bg-purple-50 border-purple-300 hover:border-purple-500 text-purple-900",
      desc: "Review & mentor projects",
    },
    {
      role: "industry" as const,
      label: "CSR Sponsor",
      email: "csr@tatatrusts.org",
      name: "Vikram Singhania (Tata CSR)",
      color: "bg-amber-50 border-amber-300 hover:border-amber-500 text-amber-900",
      desc: "Fund & deploy pilots",
    },
    {
      role: "government" as const,
      label: "Govt / Ministry",
      email: "collector@punjab.gov.in",
      name: "Dr. Ananya Roy (IAS)",
      color: "bg-sky-50 border-sky-300 hover:border-sky-500 text-sky-900",
      desc: "National impact & policy stats",
    },
    {
      role: "admin" as const,
      label: "Super Admin",
      email: "admin@sicp.gov.in",
      name: "SICP National Administrator",
      color: "bg-rose-50 border-rose-300 hover:border-rose-500 text-rose-900",
      desc: "Full system governance",
    },
  ];

  return (
    <div className="w-full max-w-lg p-8 bg-white border border-slate-200 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to SICP</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Statewide Innovation & Problem Crowdsourcing Portal
        </p>
      </div>

      {/* 1-Click Quick Demo Sign-In */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            1-Click Demo Login
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Instant evaluation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {demoRoles.map((item) => (
            <button
              key={item.role}
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin(item.role, item.email, item.name)}
              className={`p-2.5 rounded-lg border text-left transition-all duration-150 group flex flex-col justify-between ${item.color} hover:shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer`}
            >
              <div className="font-semibold text-xs transition-colors flex items-center justify-between">
                <span>{item.label}</span>
                {activePreset === item.role ? (
                  <Loader2 className="w-3 h-3 animate-spin text-slate-700" />
                ) : (
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
              <p className="text-[10px] text-slate-600 truncate mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex py-2 items-center mb-5">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-400 font-medium">Or enter credentials</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {serverError && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              {...register("email")}
              className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                errors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 focus:border-[#0052CC]"
              } rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition duration-150`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#0052CC] hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full pl-10 pr-10 py-2.5 bg-white border ${
                errors.password ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 focus:border-[#0052CC]"
              } rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition duration-150`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition duration-150 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition duration-150" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#0052CC] hover:underline transition">
          Register now
        </Link>
      </div>
    </div>
  );
}
