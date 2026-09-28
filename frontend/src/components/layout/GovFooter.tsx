import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, HelpCircle, FileText, CheckCircle2 } from "lucide-react";

export function GovFooter() {
  return (
    <footer className="w-full bg-[#052E16] text-white border-t-4 border-[#166534] mt-auto">
      {/* Top Footer: Institutional Links & Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded bg-[#166534] text-white font-bold flex items-center justify-center text-sm border border-emerald-400/40">
                SICP
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                SICP Jharkhand
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Societal Innovation Collaboration Platform — An open digital infrastructure crowdsourcing grassroots challenges across 24 districts of Jharkhand and orchestrating research collaboration through universities, JAP-IT, JSAC, and CSR grants.
            </p>
            <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5 pt-1">
              <span>Department of Higher & Technical Education & Dept. of IT & e-Governance</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200 border-b border-emerald-800/80 pb-1.5">
              Platform Portals
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-100/70">
              <li>
                <Link href="/challenges" className="hover:text-emerald-300 transition-colors">
                  Societal Challenges Feed
                </Link>
              </li>
              <li>
                <Link href="/academic" className="hover:text-emerald-300 transition-colors">
                  University Innovation Hub
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-emerald-300 transition-colors">
                  Milestone & Project Workspace
                </Link>
              </li>
              <li>
                <Link href="/partnerships" className="hover:text-emerald-300 transition-colors">
                  Industry & CSR Grants
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="hover:text-emerald-300 transition-colors">
                  Open Data Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy & Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200 border-b border-emerald-800/80 pb-1.5">
              Government Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-100/70">
              <li>
                <span>GIGW 3.0 Compliance</span>
              </li>
              <li>
                <span>Open Data Initiative</span>
              </li>
              <li>
                <span>National Innovation Framework</span>
              </li>
              <li>
                <span>SHA-256 Deliverable Hashing</span>
              </li>
              <li>
                <span>PostGIS Geo-Spatial Routing</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Help & Support */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200 border-b border-emerald-800/80 pb-1.5">
              Helpdesk & Support
            </h4>
            <div className="space-y-2 text-xs text-emerald-100/80">
              <p>
                Toll Free National Grievance Support:
                <br />
                <strong className="text-white text-sm">1800-111-SICP</strong>
              </p>
              <p>
                Support Hours: 09:00 AM – 06:00 PM IST (Mon–Sat)
              </p>
              <p className="text-[11px] text-emerald-300/80">
                Email: <span className="text-emerald-200">support.sicp@gov.in</span>
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="border-t border-emerald-800/60 my-8"></div>

        {/* Policy Links Row */}
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 text-[11px] text-emerald-200/60 text-center">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span className="hover:text-white cursor-pointer">Website Policies</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Terms of Use</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Copyright Policy</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Hyperlinking Policy</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Accessibility Statement</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Help / FAQ</span>
          </div>

          <div className="text-emerald-200/60">
            Last Updated: 28 September 2026
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="bg-[#031d0e] py-3 border-t border-emerald-900 text-center text-[11px] text-emerald-300/70 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong>Government of Jharkhand</strong> · SICP Platform. All Rights Reserved.
          </span>
          <span className="text-emerald-300/60">
            Official State Portal · Department of Higher & Technical Education, Government of Jharkhand
          </span>
        </div>
      </div>
    </footer>
  );
}
