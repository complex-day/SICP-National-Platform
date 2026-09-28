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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="w-full max-w-2xl p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create SICP Account</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Join the statewide innovation ecosystem to transform challenges into measurable social impact
        </p>
      </div>

      {isSuccess ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Registration Successful!</h3>
          <p className="text-xs text-emerald-800">
            Your account has been created. Redirecting you to the sign-in page...
          </p>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Your Stakeholder Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setValue("role", r.id, { shouldValidate: true })}
                      className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 border-[#166534] ring-1 ring-[#166534] text-[#14532D] shadow-xs"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-[#166534]" : "text-slate-500"}`} />
                        <span className="font-semibold text-xs">{r.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{r.desc}</span>
                    </button>
                  );
                })}
              </div>
              {errors.role && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.role.message}</p>
              )}
            </div>

            {/* Core Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="full_name">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="Rahul Kumar"
                    {...register("full_name")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                      errors.full_name ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]"
                    } rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition`}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="rahul@example.com"
                    {...register("email")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                      errors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]"
                    } rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone & District / Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    {...register("phone")}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition"
                  />
                </div>
              </div>

              {selectedRole === "citizen" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="district">
                    District / Region
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <input
                      id="district"
                      type="text"
                      placeholder="e.g. Ranchi"
                      {...register("district")}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "industry" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="company_name">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      id="company_name"
                      type="text"
                      placeholder="e.g. Tata Steel CSR"
                      {...register("company_name")}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "faculty" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="specialization">
                    Department / Specialization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <input
                      id="specialization"
                      type="text"
                      placeholder="e.g. Water Resources Engineering"
                      {...register("specialization")}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534] rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border ${
                      errors.password ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]"
                    } rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border ${
                      errors.confirmPassword ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 focus:border-[#166534] focus:ring-1 focus:ring-[#166534]"
                    } rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#166534] hover:bg-[#14532D] active:bg-[#052E16] text-white font-semibold rounded-lg shadow-xs transition duration-150 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition duration-150" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#166534] hover:underline transition">
              Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
