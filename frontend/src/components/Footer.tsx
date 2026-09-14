import React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 SICP – Societal Innovation Collaboration Platform. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="text-slate-400 font-medium">Module 1: Identity & Access Management</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Zero Trust RBAC Architecture</span>
        </div>
      </div>
    </footer>
  );
}
