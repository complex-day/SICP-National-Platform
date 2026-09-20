import Link from "next/link";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
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

        <RegisterForm />
      </div>
    </div>
  );
}
