"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Clean and auto-generate items if not explicitly provided
  const breadcrumbItems = React.useMemo(() => {
    let raw = items;
    if (!raw) {
      if (!pathname || pathname === "/") return [];
      const segments = pathname.split("/").filter(Boolean);
      raw = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return { label, href };
      });
    }

    if (showHome && raw.length > 0 && raw[0].label.toLowerCase() === "home") {
      return raw.slice(1);
    }
    return raw;
  }, [pathname, items, showHome]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1.5 flex-wrap">
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              title="Home"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={item.href || index}>
              {(showHome || index > 0) && (
                <li aria-hidden="true" className="text-muted-foreground/50">
                  <ChevronRight className="h-3 w-3" />
                </li>
              )}
              <li className="flex items-center">
                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    className="font-medium text-foreground truncate max-w-[180px] sm:max-w-none"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
