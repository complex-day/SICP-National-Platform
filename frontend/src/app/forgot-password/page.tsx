"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/features/auth/auth.schema";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      await authService.forgotPassword(values);
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Failed to initiate password reset.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center relative px-4 py-12">
      <div className="relative z-10 w-full flex flex-col items-center">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0052CC] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SICP National Portal</span>
        </Link>

        <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter your registered email address to receive a secure password recovery link.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-xs text-emerald-800 font-medium">
                If your email is registered in the system, a recovery link has been dispatched.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#0052CC] hover:underline font-semibold mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <>
              {serverError && (
                <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
                    Registered Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      {...register("email")}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                        errors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-300 focus:border-[#0052CC]"
                      } rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0052CC] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Send Recovery Link</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
