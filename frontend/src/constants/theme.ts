export const GOV_COLORS = {
  primary: "#166534",       // Primary Forest Green
  deepForest: "#14532D",    // Deep Forest
  darkForest: "#052E16",    // Dark Forest
  success: "#16A34A",       // Success Green
  accent: "#22C55E",        // Accent Green
  danger: "#DC2626",        // Danger Red
  warning: "#D97706",       // Warning Amber
  info: "#0369A1",          // Info Blue

  background: "#F8FAFC",    // Layer 2: Soft Slate
  surface: "#FFFFFF",       // Layer 1: Clean White
  section: "#EEF2F7",       // Layer 3: Government Grey
  border: "#E2E8F0",        // Clean Slate Border

  textPrimary: "#0F172A",   // Primary Text
  textSecondary: "#475569", // Secondary Text
  textMuted: "#64748B",     // Muted Text
};

export const GOV_THEME = {
  colors: GOV_COLORS,
  typography: {
    pageTitle: "text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight",
    sectionTitle: "text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight",
    cardTitle: "text-lg font-semibold text-[#0F172A]",
    cardLabel: "text-xs font-semibold uppercase tracking-wider text-[#475569]",
    kpiNumber: "text-3xl font-bold text-[#0F172A]",
    body: "text-sm text-[#475569] leading-relaxed",
    metadata: "text-xs text-[#64748B]",
  },
  card: {
    base: "bg-white border border-[#E2E8F0] rounded-lg shadow-xs p-5",
    hover: "hover:border-[#166534]/50 transition-colors",
  },
};

