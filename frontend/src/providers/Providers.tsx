"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sicp_theme">
      <QueryProvider>
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
