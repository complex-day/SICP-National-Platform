"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, PlusCircle, Layers, ShieldCheck, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Challenges", href: "/citizen/my-challenges", icon: FileText },
  { label: "Submit", href: "/citizen/create-challenge", icon: PlusCircle, isPrimary: true },
  { label: "Projects", href: "/projects", icon: Layers },
  { label: "Ledger", href: "/transparency", icon: ShieldCheck },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E2E8F0] shadow-md flex items-center justify-around z-40 px-2">
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="h-12 w-12 rounded-full bg-[#166534] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#14532D] transition-all">
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-[#166534] mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors",
              isActive
                ? "text-[#166534] font-bold"
                : "text-[#64748B] hover:text-[#0F172A]"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive ? "text-[#166534]" : "text-[#64748B]")} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
