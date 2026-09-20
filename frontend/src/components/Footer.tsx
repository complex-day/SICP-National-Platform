import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/60 py-8 text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            SICP – Societal Innovation Collaboration Platform
          </p>
          <p className="text-[11px] text-muted-foreground">
            Smart India Hackathon (SIH 26043) · National Open-Data Innovation Architecture
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs flex-wrap justify-center">
          <Link href="/transparency" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Open Data Ledger</span>
          </Link>
          <Link href="/challenges" className="hover:text-foreground transition-colors">
            Civic Marketplace
          </Link>
          <Link href="/governance" className="hover:text-foreground transition-colors">
            Impact Intelligence
          </Link>
          <span className="text-border">|</span>
          <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for India
          </span>
        </div>
      </div>
    </footer>
  );
}
