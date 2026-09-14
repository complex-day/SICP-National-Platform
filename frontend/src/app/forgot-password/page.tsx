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
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-sm text-slate-400 mt-2">
            Enter your registered email address to receive a secure password recovery link.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-sm text-emerald-200">
              If your email is registered in the system, a recovery link has been dispatched.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <>
            {serverError && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-3 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...register("email")}
                    className={`w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border ${
                      errors.email ? "border-red-500" : "border-slate-700"
                    } rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
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
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
