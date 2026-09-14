"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Building,
  GraduationCap,
  Briefcase,
  Landmark,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { registerSchema, RegisterInput } from "./auth.schema";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api";

const ROLES = [
  { id: "citizen", label: "Citizen", icon: UserIcon, desc: "Report & track community problems" },
  { id: "student", label: "Student", icon: GraduationCap, desc: "Build prototypes & join projects" },
  { id: "faculty", label: "Faculty", icon: Building, desc: "Mentor innovators & lead research" },
  { id: "industry", label: "Industry", icon: Briefcase, desc: "Sponsor projects & provide CSR funds" },
  { id: "government", label: "Government", icon: Landmark, desc: "Monitor impact & validate solutions" },
  { id: "admin", label: "Admin", icon: Shield, desc: "System moderation & configuration" },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "citizen",
      district: "",
      state: "",
      company_name: "",
      specialization: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      await authService.register(values);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Registration failed. Please review your details and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-blue-500/5">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create SICP Account</h2>
        <p className="text-sm text-slate-400 mt-2">
          Join the statewide innovation ecosystem to transform challenges into measurable social impact
        </p>
      </div>

      {isSuccess ? (
        <div className="p-8 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
          <p className="text-sm text-emerald-200">
            Your account has been created. Redirecting you to the sign-in page...
          </p>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-800/80 rounded-xl flex items-center gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Select Your Stakeholder Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setValue("role", r.id, { shouldValidate: true })}
                      className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition duration-200 ${
                        isSelected
                          ? "bg-blue-600/20 border-blue-500 ring-1 ring-blue-500 text-white shadow-md shadow-blue-500/10"
                          : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                        <span className="font-semibold text-sm">{r.label}</span>
                      </div>
                      <span className="text-xs text-slate-400 line-clamp-1">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-400">{errors.role.message}</p>
              )}
            </div>

            {/* Core Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="full_name">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="Rahul Kumar"
                    {...register("full_name")}
                    className={`w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border ${
                      errors.full_name ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-blue-500"
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition`}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="rahul@example.com"
                    {...register("email")}
                    className={`w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border ${
                      errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-blue-500"
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone & District / Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    {...register("phone")}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition"
                  />
                </div>
              </div>

              {selectedRole === "citizen" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="district">
                    District / Region
                  </label>
                  <input
                    id="district"
                    type="text"
                    placeholder="e.g. Ranchi"
                    {...register("district")}
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition"
                  />
                </div>
              )}

              {selectedRole === "industry" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="company_name">
                    Company / Organization Name
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    placeholder="e.g. Tata Steel CSR"
                    {...register("company_name")}
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition"
                  />
                </div>
              )}

              {selectedRole === "faculty" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="specialization">
                    Department / Specialization
                  </label>
                  <input
                    id="specialization"
                    type="text"
                    placeholder="e.g. Water Resources Engineering"
                    {...register("specialization")}
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition"
                  />
                </div>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full pl-11 pr-11 py-2.5 bg-slate-800/80 border ${
                      errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-blue-500"
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border ${
                      errors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : "border-slate-700 focus:border-blue-500"
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none transition`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition duration-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition">
              Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
