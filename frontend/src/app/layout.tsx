import type { Metadata } from "next";
import { Providers } from "@/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SICP – Societal Innovation Collaboration Platform",
  description:
    "AI-driven statewide platform transforming citizen-reported societal challenges into real-world solutions through university, industry, and government collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
