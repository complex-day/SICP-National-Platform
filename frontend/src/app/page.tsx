import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Landmark,
  User,
  Lightbulb,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4" />
          <span>SICP Architecture v1.0 • Module 1 (IAM)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Transforming Societal Challenges into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400">
            Real-World Solutions
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          A unified AI-orchestrated collaboration ecosystem connecting Citizens, Universities,
          Students, Industry Partners, and Government Agencies.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-blue-500/25 transition duration-200 flex items-center gap-2 text-base group"
          >
            <span>Create Account</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition duration-200" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700/80 transition duration-200 text-base"
          >
            Sign In
          </Link>
        </div>

        {/* Stakeholder Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
          {[
            {
              role: "Citizens",
              icon: User,
              desc: "Report local challenges & track verified progress in real time",
              color: "border-blue-500/30 text-blue-400",
            },
            {
              role: "Students",
              icon: GraduationCap,
              desc: "Form multi-disciplinary teams & engineer working prototypes",
              color: "border-emerald-500/30 text-emerald-400",
            },
            {
              role: "Faculty",
              icon: Lightbulb,
              desc: "Mentor student teams & lead academic research initiatives",
              color: "border-purple-500/30 text-purple-400",
            },
            {
              role: "Industry",
              icon: Briefcase,
              desc: "Sponsor projects, provide CSR funding & industrial mentorship",
              color: "border-amber-500/30 text-amber-400",
            },
            {
              role: "Government",
              icon: Landmark,
              desc: "Monitor district-level impact analytics & validate deployments",
              color: "border-cyan-500/30 text-cyan-400",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition"
              >
                <div className={`p-2.5 rounded-lg w-fit bg-slate-800 border ${item.color} mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">{item.role}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
